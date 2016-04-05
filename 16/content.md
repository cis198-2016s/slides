# Higher-Rank Trait Bounds

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

