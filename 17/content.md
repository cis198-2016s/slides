# Borrowing & Owning

### CIS 198 Lecture 17

---
## Borrowing vs. Owning

- Consider this struct:

```rust
struct StrToken<'a> {
    raw: &'a str,
}

impl<'a> StrToken<'a> {
    pub fn new(raw: &'a str) -> StrToken<'a> {
        StrToken { raw: raw, }
    }
}

// ...

let secret: String = load_secret("api.example.com");
let token = StrToken::new(&secret[..]);
```

*Code and examples taken from [From &str to Cow](http://blog.jwilm.io/from-str-to-cow)

???

This struct works fine for `&'static str`s, but is pretty inflexible. The use
case this was presented in was one where `StrToken` represents an authentication
token or application secret; in this case, you're basically forced to store the
secret key in the application's binary, since this doesn't let you load it
ad-hoc at runtime, e.g. from a file. Also, in the last two lines of code, we've
forced the token to only live as long as `secret`, so `token` can't escape the
current stack frame, as `secret` will no longer be valid if it does. This whole
implementation is silly and we'd like to be able to do it differently...

---
## Borrowing vs. Owning

```rust
struct StringToken {
    raw: String,
}

impl StringToken {
    pub fn new(raw: String) -> StringToken {
        StringToken { raw: raw, }
    }
}
```

???

This basically solves the problem we had before by switching out an `&str` for a
`String`-- now we can load our secret at runtime _and_ we don't have to worry
about lifetimes. Because `StringToken` owns its contents, it is guaranteed that
its contents will _always be valid_. This is convenient, but is also not the
best implementation. For one, we can't make `StringToken`s out of raw strings
without _first_ coercing them into `String`s, which is not great. We could
design this to do the `&str -> String` coercion for us, but that's also not a
good solution, since we'd either have to make an additional constructor, or
force an additional heap allocation in certain cases. If we make one constructor
that just takes an `&str`, anyone who already has a `String` has to slice the
`String` up into an `&str` and then allocate it on the heap _again_, even though
they've _already done that_ by having a `String`. If we make two constructors,
then we're basically duplicating code with only minor differences, which is
unergonomic. The whole thing is silly and inefficient, and there really should
be a way around it without having to settle for either of these solutions.

---
### `std::convert::Into` & `std::convert::From`

```rust
pub trait Into<T> {
    fn into(self) -> T;
}

pub trait From<T> {
    fn from(T) -> Self;
}

impl<T, U> Into<U> for T where U: From<T> { /* ... */ }
```

???

`Into` is, guess what, a trait for converting types into other types by
consuming the original value and producing a new one. Some standard library
types implement `Into` in various ways, e.g. `String` implements `Into<Vec<u8>>`
so you can get at the raw bytes behind a `String`. There's also a symmetric
trait `From`, that is the opposite of `Into`. In fact, if `T` can be converted
`Into<U>`, then `U` can be created `From<T>`. We're going to use these traits to
build up a new abstraction that will let us more effectively solve the
`&str`-`String` duality we were just dealing with.

---
## Borrowing \/ Owning

```rust
struct Token {
    raw: String,
}

impl Token {
    pub fn new<S: Into<String>>(raw: S) -> Token
        Token { raw: raw.into(), }
    }
}
```

???

With the help of `Into`, we ensure our argument can always be converted into a
`String`, and then convert it in the constructor. `Into<T>` is always
implemented for `T` itself, so this works fine with `String`s. `&str` and
`String` have `From`/`Into` `impl`s for each other because of the last generic
`impl` on the previous slide; if you look for them in the standard library, you
won't find them directly. So, great, we've made this much more convenient to
use! However, we still haven't solved the allocation problem: an `&str` argument
still has to be converted into a `String`, which costs us.

---
## Bovine Intervention!

```rust
pub enum Cow<'a, B> where B: 'a + ToOwned + ?Sized {
    Borrowed(&'a B),
    Owned(B::Owned),
}
```

???

`Cow`, short for "clone-on-write", is a type of smart pointer enum thing. It's a
little bit hard to describe. The type is constrained by some lifetime `'a` and a
generic type `B`. `B` is constrained by `'a + ToOwned + ?Sized`, which means
this:
        - `'a`: `B` cannot contain a lifetime shorter than `'a`
        - `ToOwned`: `B` must implement the `ToOwned` trait, which describes how
            to convert it to an owned value
        - `?Sized`: `B` is allowed to be unsized at compile time, which
            basically just means you can use trait objects with `Cow`s
`Cow` has two variants:
        - `Borrowed(&'a B)`: a reference to a `B`, bound to the lifetime of the
            trait bound
        - `Owned(B::Owned)`: the associated type from the `ToOwned` trait; this
            variant owns its value (obviously)
When you want to mutate a `Cow` (gosh that sounds mad science-y), call `to_mut`
on it. This causes its internal representation to be converted to the `Owned`
variant, hence the clone-on-write semantics. Note that this causes an
allocation.

Aside: there's a now-deprecated trait called `IntoCow` which I think is probably
the best trait name in `std`.

---
## Bovine Intervention!
    
```rust
struct Token<'a> {
    raw: Cow<'a, str>,
}

impl<'a> Token<'a> {
    pub fn new<S: Into<Cow<'a, str>>(raw: S) -> Token<'a>
        Token { raw: raw.into(), }
    }
}

// ...

let token = Token::new(Cow::Borrowed("it's a secret"));
let secret: String = load_secret("api.example.com");
let token = Token::new(Cow::Owned(secret));
```

???

Now we can pass either a `String` or an `&str` into our struct just fine, and
`&str`s won't trigger an allocation. The lifetime bound on an `&str` still needs
to be `'static` for it to escape the current stack frame, but we can't really
solve that problem anyway. We can also send `Token`s across threads, so long as
they're `'static`. Pretty nice, right?

---
## Recap

- If you want to have the potential to own _or_ borrow a value in a struct,
    `Cow` is right for you. 
- `Cow` can be used with more than just `&str`/`String`, though this is a very
    common usage.
- When you mutate a `Cow`, it might have to allocate and become its `Owned`
    variant.
- The type inside of the `Cow` must be convertible to some owned form.
