# Subtyping & Variance

### CIS 198 Lecture 16

---
## Higher-Rank Trait Bounds

```rust
struct Closure<F> {
    data: (u8, u16),
    func: F,
}

impl<F> Closure<F> where F: Fn(&(u8, u16)) -> &u8 {
    fn call(&self) -> &u8 {
        (self.fun)(&self.data)
    }
}

fn do_it(data: &(u8, u16)) -> &u8 { &data.0 }

fn main() {
    let c = Closure { data: (0, 1), func: do_it, };
    c.call();
}
```

???

Closures in Rust are pretty magical when it comes to their underlying implementation. This code
compiles fine, but has some lifetime weirdness. Let's desugar it and explictly annotate the lifetimes
that the compiler inserts (more or less). Note that the code on the next slide doesn't compile in
Rust because you can't annotate lifetimes that way, but the idea we're expressing is correct.

---
## Higher-Rank Trait Bounds

```rust
struct Closure<F> {
    data: (u8, u16),
    func: F,
}

impl<F> Closure<F> where F: Fn(&'??? (u8, u16)) -> &'??? u8 {
    fn call<'a>(&'a self) -> &'a u8 {
        (self.fun)(&self.data)
    }
}

fn do_it<'b>(data: &'b (u8, u16)) -> &'b u8 { &'b data.0 }

fn main() {
    'x: {
        let c = Closure { data: (0, 1), func: do_it, };
        c.call();
    }
}
```

???

Here, we can describe the lifetimes of everything in play _except_ for the references in use in the
function we're storing inside the `Closure` struct. We have to provide _some_ lifetime bound for these
references, but the lifetime can't be named until the body of `call` is entered, so we're stuck.
Moreover, `call` has to work with _any_ lifetime that `&self` has at this point; we already know that
this code compiles and works fine in Rust, so _how_ does it work?

---
## Higher-Rank Trait Bounds

```rust
impl<F> Closure<F> where for<'a> F: Fn(&'a (u8, u16)) -> &'a u8 {
    fn call<'a>(&'a self) -> &'a u8 {
        (self.fun)(&self.data)
    }
}

```

???

The compiler desugars this lifetime bound like so. You can read this as "where for all choices of
the lifetime `a`, F is such and such type". This effectively produces an infinite list of trait bounds
that `F` must satisfy. Generally, this doesn't come up very much. However, if you're doing something
more complex with function pointers and closures, you may run into needing this syntax. Anywhere you
may have a `Trait<'a>`, a `for<'a> Trait<'a>` is also allowed. It may not seem super obvious why you
need these at all if you aren't thinking about lifetimes too hard. However, recall that lifetimes
are kind of like type parameters-- an `&'a` and an `&'static` may not always be compatible! Without
HRTBs, it would be hard to abstract over function types, as lifetime bounds would cause conflicts.

---
## Inheritance vs. Subtyping

- Rust does not support structural inheritance.
    - No classes, virtual functions (sort of), method overriding, etc.
- Subtyping in Rust derives exclusively from lifetimes.
- Lifetimes may be partially ordered based on a containment relation.

---
## Lifetime Subtyping

- Lifetime subtyping is in terms of the containment relationship:
    - If lifetime `a` contains (outlives) lifetime `b`, then `'a` is a subtype
        of `'b`.
    - In Rust syntax, this relationship is written as `'a: 'b`.

???

This relationship is somewhat counter-intuitive-- if `a` outlives `b`, why is
`a` a subtype of `b`? `a` is larger than `b`, but it's a subtype; why do we
express this relationship this way? From a typing perspective, think of it like
this: if you want an `&'a str` and I give you an `&'static str`, that should be
totally fine. Similarly, in an OO world with structural inheritance, if you have
a collection of type `Animal` and I give you a `Cat` to insert into it, that
should be fine as well. Hence, lifetimes express the same subtyping
relationship. If you have a higher-rank lifetime (e.g. from a higher-rank trait
bound), they're also subtypes of every concrete lifetime, since they can specify
any arbitrary lifetime.

---
## Type Variance

- Variance is a property of type constructors with respect to their arguments.
- Type constructors in Rust can be either _variant_ or _invariant_ over their types.
- Variance: `F` is _variant_ over `T` if `T` being a subtype of `U` implies
    `F<T>` is a subtype of `F<U>`.
    - Subtyping "passes through".
- Invariance: `F` is _invariant_ over `T` in all other cases.
    - No subtyping relation can be derived.

???

Rust's variance relation is actually a covariance relation; other languages also
have contravariance over certain types, but Rust doesn't except over functions,
which may change in the future. For reference, `fn(T)` is contravariant in `T`.
However, because traits don't have inferred variance, `Fn(T)` is invariant in
`T`.

---
## Type Variance

- `&'a T` is variant over `'a` and `T`
    - As is `*const T`.
- `&'a mut T` is variant over `'a` but invariant over `T`.
- `Fn(T) -> U` is invariant over `T` but variant over `U`.
- `Box<T>`, `Vec<T>`, etc. are all variant over `T`
- `Cell<T>` and any other types with interior mutability are invariant over `T`
    - As is `*mut T`.

---
## Type Variance

- Why do the above properties hold?

???

`&'a T` is variant over `'a` for reasons already discussed. Why over `T`?
An `&&'static str` is appropriate when an `&&'a str` would be. `&'a mut T`'s
lifetime variance also makes sense, but its type invariance might not. Let's
look at a code example...

---
### `&'a mut T` Type Invariance

```rust
fn overwrite<T: Copy>(input: &mut T, new: &mut T) {
    *input = *new;
}

let mut forever: &'static str = "hello";
{
    let s = String::from("world");
    overwrite(&mut forever, &mut &*s);
}
println!("{}", forever);
```

- In general, if variance would allow you to store a short-lived value into a
    longer-lived slot, you must have invariance.

???

Everything about this code looks fine, except it actually ends up printing freed
memory at the end. If `&mut T` were variant over `T`, then `&mut &'static str`
would be a subtype of `&mut &'a str`, and you could downgrade the `'static`
lifetime to `'a`. This would allow you to overwrite `forever` with a `s`, drop
`s` after the inner scope exits in the above program, and then still access its
memory via `forever`. This is tricky, since you have to remember that lifetimes
are _part of_ types, and therefore their variance must be considered in the `T`
slot of other references. `&'a mut T` is allowed to be variant over `'a` because
`'a` is a property of the reference, but `T` is borrowed by the reference. If
the `'a` changes, only the reference will know; if you change the `T`, somebody
else will know, so you can't do this. "The `'a` is owned, the `T` is borrowed."

---
## Type Variance

- `Box` and `Vec` are variant over `T`, even though this looks like it breaks
    the rule we just defined.
- Because you can only mutate a `Box` via an `&mut` reference, they become
    invariant when mutated!
    - This prevents you from storing shorter-lived types into longer-lived
        containers.
- Cell types need invariance over `T` for the same reason `&mut T` does.
    - Without invariance, you could smuggle shorter-lived types into
        longer-lived cells.

---
## Type Variance

- What about the variance of types you define yourself?
- Struct `Foo` contains a field of type `A`...
    - `Foo` is variant over `A` if all uses of `A` are variant.
    - Otherwise, it's invariant over `A`.

---
## Type Variance

```rust
    struct Foo<'a, 'b, A: 'a, B: 'b, C, D, E, F, G, H> {
        a: &'a A,     // variant over 'a and A
        b: &'b mut B, // variant over 'b, invariant over B
        c: *const C,  // variant over C
        d: *mut D,    // invariant over D
        e: Vec<E>,    // variant over E
        f: Cell<F>,   // invariant over F
        g: G,         // variant over G
        h1: H,        // would be variant over H...
        h2: Cell<H>,  // ...but Cell forces invariance
    }
```

---
## Type Variance

- A good way to think about lifetime variance is in terms of ownership.
- If someone else owns a value, and you own a reference to it, the reference can
    be variant over its lifetime, but might not be variant over the value's
    type.
