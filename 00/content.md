# CIS 198: Intro to COBOL #

![](img/cobol.png)

---
# CIS 198: Intro to COBOL #

- Designed in 1959 (57 years ago!)
- We will be using the COBOL2014 standard.

```cobol
IDENTIFICATION DIVISION.
PROGRAM-ID. hello-world.
PROCEDURE DIVISION.
    DISPLAY "Hello, world!"
    .
```

---
# CIS 198: Rust Programming #

![](img/rust.png)

---
# Lecture 00: Hello, Rust! #

![](img/ferris.png)

---
## Overview ##

"Rust is a systems programming language that runs blazingly fast, prevents
nearly all segfaults, and guarantees thread safety." -- [rust-lang.org](https://www.rust-lang.org/)

---
### What _is_ Rust? ###

Rust is:
- Fast
- Safe
- Functional
- Zero-cost

---
### Fast ###

- Rust compiles to native code
- Rust has no garbage collector
- Most abstractions have zero cost
- Fine-grained control over lots of things
- Pay for exactly what you need...
- ...and pay for most of it at compile time

---
### Safe ###

- No null
- No uninitialized memory
- No dangling pointers
- No double free errors
- No manual memory management!

---
### Functional ###

- First-class functions
- Trait-based generics
- Algebraic datatypes
- Pattern matching

---
### Zero-Cost 100% Safe Abstractions ###

- Rust's defining feature
- Strict compile-time checks remove need for runtime
- Big concept: Ownership

---
### Release Model

- Rust has a new stable release every six weeks
- Nightly builds are available, well, nightly
- Current stable: Rust 1.5
- Rust 1.6 will be out tomorrow (1/21)!
    - This is the version we'll be using in this class

Date | Stable | Beta | Nightly
--- | --- | --- | ---
2015-12-10 | 🚂 1.5 | 🚆 1.6 | 🚝 1.7
2016-01-21 | 🚆 1.6 | 🚝 1.7 | 🚈 1.8
2016-03-03 | 🚝 1.7 | 🚈 1.8 | 🚅 1.9

---
### Development

- Rust is developed by Mozilla Research.
- With very active community involvement -- on GitHub, Reddit, irc.
    - [Rust Source](https://github.com/rust-lang/rust/)
    - [Rust Internals Forum](https://internals.rust-lang.org/)
    - [/r/rust](http://www.reddit.com/r/rust)

---
### Who Uses Rust?

![](img/rust-in-production.png)

---
### Big Rust Projects

- [Servo](https://github.com/servo/servo)
- [Piston](https://github.com/PistonDevelopers/piston)
- [MIO](https://github.com/carllerche/mio)
- [nickel.rs](http://nickel.rs/)
- [iron](https://github.com/iron/iron)
- [lalrpop](https://github.com/nikomatsakis/lalrpop)
- [cargo](https://github.com/rust-lang/cargo)
- [Rust itself!](https://github.com/rust-lang/rust/)

---
## Administrivia (TODO)

- X homeworks (xx%), final project (xx%)
- Weekly Rust lecture: Wed. 4:30-6:00pm, Towne 321
- Mini-Course lecture: Tue. 6:00-7:30pm, Berger Auditorium (SKIR AUD)
- [Piazza](https://piazza.com/class/iiksjduyiy773s)
    - We will be using Piazza for announcements; make sure you have gotten emails!

Consult [the website](http://cis198-2016s.github.io/) for homework assignments and further details.

## Administrivia - Homeworks

- X homeworks
- Released on Wednesdays and (usually) due the following Wednesday night, midnight.
- We will be using Classroom for GitHub.
    - Click the link to make a private repo for every homework, which will be your submission.
- 5 24-hour late days for the semester.
    - Use up to 2 late days on an assigment.

---
## Helpful Links ##

- [Official Rust Docs](https://doc.rust-lang.org/stable/std/)
- [The Rust Book (our course textbook)](https://doc.rust-lang.org/stable/book/)
- [Rust By Example](http://rustbyexample.com/)
- [Rust Playpen](https://play.rust-lang.org/)
    - Online editing and execution!

---
## Let's Dive In! ##

Hello, Rust!

```rust
fn main() {
    println!("Hello, CIS 198!");
}
```

---
# Basic Rust Syntax #

---
### Variable Bindings ###
- Variables are bound with `let`:
```rust
let x = 17;
```

- Bindings are implicitly-typed: the compiler infers based on context.
- The compiler can't always determine the type of a variable, so sometimes you
  have to add type annotations.
```rust
let x: i16 = 17;
```

- Variables are inherently immutable:
```rust
let x = 5;
x += 1; // error: re-assignment of immutable variable x
let mut y = 5;
y += 1; // OK!
```

---
### Variable Bindings ###
- Bindings may be shadowed:
```rust
let x = 17;
let y = 53;
let x = "Shadowed!";
// x is not mutable, but we're able to re-bind it
```

- The shadowed binding for `x` above lasts until it goes out of scope.
- Above, we've effectively lost the first binding, since both `x`s are in the same scope.

- Patterns may also be used to declare variables:
```rust
let (a, b) = ("foo", 12);
```
(more on this later)

---
### Expressions ###

- (Almost!) everything is an expression: something which returns a value.
    - Exception: variable bindings are not expressions.
- Turn an expression into a statement by adding a semicolon (discarding its value).

- The "nothing" value is called "unit", which is written `()`. Statements return `()`.
- If a function has no explicit return value, it returns `()`.

```rust
fn foo() {
}

fn foo() -> () {
}
```

---
### Expressions ###
- Because everything is an expression, we can bind many things to variable names:
```rust
let x = -5;
let y = if x > 0 { "greater" } else { "less" };
println!("{}", y); // "less"
```

- Aside: `"{}"` is Rust's string interpolation operator
    - Similar to Python, Ruby, C#, and others; like `printf`'s `"%s"` in C/C++.

---
### Primitives ###

- `bool`: spelled `true` and `false`.
- `char`: spelled like `'c'` or `'😺'` (`chars` are Unicode!).

- Numerics: specify the signedness and size.
    - `i8`, `i16`, `132`, `i64`, `isize`
    - `u8`, `u16`, `132`, `u64`, `usize`
    - `f32`, `f64`
    - Type inference for numeric literals will default to `i32` or `f64`.

---
### References ###

- Reference *types* are written with an `&`: `&i32`.
- References can be taken with `&` (like C/C++).
- References can be _dereferenced_ with `*` (like C/C++).
- References are guaranteed to be valid.
    - Validity is enforced through compile-time checks!
- These are *not* the same as pointers!
- Reference lifetimes are pretty complex, as we'll explore later on in the course.

```rust
let x = 12;
let ref_x = &x;
println!("{}", *x); // 12
```

---
### Arrays ###
- Arrays are generically of type `[T; N]`.
    - N is a compile-time _constant_. Arrays cannot be resized.
    - Array access is bounds-checked at _compile time_.
- Arrays are indexed with `[]` like most other languages:
    - `arr[3]` gives you the 4th element of `arr`

```rust
let arr1 = `[1, 2, 3]`; // (array of 3 elements)
let arr2 = `[2; 32]`;   // (array of 32 `2`s)
```

---
### Slices ###
- Generically of type `&[T]`
- A "view" into an array by reference
- Not created directly, but are borrowed from other variables
- Mutable or immutable
- How do you know when a slice is still valid? Coming soon...

```rust
let arr = [0, 1, 2, 3, 4, 5];
let total_slice = &arr[..];     // Slice all of `arr`
let partial_slice = &arr[2..5]; // [2, 3, 4]
```

---
### Strings ###
- Two types of Rust strings: `String` and `str`
- `String` is a heap-allocated, growable vector of characters
- `str` is an unsized type* that's used to slice `String`s as an `&str`
- String literals like `"foo"` are of type `&str`
    - To make a `String` from an `&str`, use `"foo".to_string()` or `String::from("foo")`

```rust
let s: &str = "foo";
let s1: String = "foo".to_string();
let s2: String = String::from("foo");
```

*type which doesn't have a compile-time known size

---
### Tuples ###
- Fixed-size, ordered, heterogeneous lists
- Index into tuples with `foo.0`, `foo.1`, etc.
- Can be destructured in `let` bindings
    ```rust
    let foo: (i32, char, f64) = (72, 'H', 5.);
    let (x, y, z) = (72, 'H', 5.);
    let (a, b, c) = foo;
    ```

---
### Casting ###

- Cast between types with `as`:

```rust
let x: i32 = 100;
let y: u32 = x as u32;
```

- Naturally, you can only cast between types that are safe to cast between.
    - No casting `[i16; 4]` to `char`!
    - There are unsafe mechanisms to overcome this, if you know what you're doing.

---
## Control Flow ##

---
### If Statements ###

```rust
if x > 0 {
    10
} else if x == 0 {
    0
} else {
    println!("Not greater than zero!");
    -10
}
```
- No parens necessary.
- Entire if statement evaluates to one expression, so every arm must end with
  an expression of the same type.

---
### Loops ###
- Loops come in three flavors: `while`, `loop`, and `for`.
    - `break` and `continue` exist just like in most languages

- `while` works just like you'd expect:

```rust
let mut x = 0;
while x < 100 {
    x += 1;
    println!("x: {}", x);
}
```

---
### Loops ###
- `loop` is equivalent to `while true`, but the compiler can take advantage of
  knowing that it's infinite

```rust
let mut x = 0;
loop {
    x += 1;
    println!("x: {}", x);
}
```

---
### Loops ###
- `for` is the most different from most C-like languages
     - `for` loops use an _iterator expression_:

```rust
// 0..10 is an iterator from 0 to 10 (exclusive)
for x in 0..10 {
    println!("{}", x);
}

let xs = [0, 1, 2, 3, 4];
// Arrays can be used as iterators.
for x in xs {
    println!("{}", x);
}
```

---
### Functions ###

```rust
fn foo(x: T, y: U, z: V) -> T {
    // ...
}
```

- `foo` is a function that takes three parameters:
    - `x` of type `T`,
    - `y` of type `U`,
    - `z` of type `V`,
    - then returns a `T`.

- Must explicitly define the types of function arguments and return value.
    - The compiler is actually smart enough to figure this out for you, but
      Rust's designers decided it was better practice to force explicit function
      typing.

---
### Functions ###

- The final expression in a function is its return value.
    - Use `return` for _early_ returns from a function.

```rust
fn square(n: i32) -> i32 {
    n * n
}

fn square(n: i32) -> i32 {
    if n < 5 {
        return n;
    }
    n * n
}

fn square(n: i32) -> i32 {
    n * n;
}
```

- The last one won't even compile!
- Why? Its last statement ends in a semicolon, so it evaluates to `()`.

---
### Bonus: Function Pointers ###
- Much simpler than in C:

```rust
let x: fn(i32) -> i32 = square;
```

---
### `Vec<T>` ###

- A `Vec` (pronounced "vector") is a growable array allocated on the heap.
    - (cf. Java ArrayList, C++ std::vector, etc.)
- `<T>` denotes a generic type.
    - The type of a `Vec` of `i32`s is `Vec<i32>`.
    - Type inference is only possible if you add elements to the `Vec`.
- Vectors can be created with `Vec::new()` or with the `vec!` macro.
    - `Vec::new()` is an example of namespacing. `new` is a function defined in
      the `Vec` struct.

---
### `Vec<T>` ###
```rust
// Explicit typing
let v0: Vec<i32> = Vec::new();

// v1 and v2 are equal
let mut v1 = Vec::new();
v1.push(1);
v1.push(2);
v1.push(3);

let v2 = vec![1, 2, 3];
```

```rust
// v3 and v3 are equal
let v3 = vec![0; 4];
let v4 = vec![0, 0, 0, 0];
```

---
### `Vec<T>` ###

```rust
let v2 = vec![1, 2, 3];
let i = v2[2]; // 3
```

- Like arrays, vectors can be indexed with `[]`.
    - You can't index a vector with an i32/i64/etc.
    - You must use a `usize` because `usize` is guaranteed to be the same size as a pointer

- Vectors has an extensive stdlib method list, which can be found at the
  [offical Rust documentation](https://doc.rust-lang.org/stable/std/vec/).

---
### Macros!

- Macros are like functions, but they're named with an `!` at the end.
- Can do generally very powerful stuff.
    - They actually generate code at compile time!
- Call and use macros like functions.
- You can define your own with `macro_rules! macro_name` blocks.
    - These are *very* complicated. More later!
- Because they're so powerful, a lot of common utilities are defined as macros.

---
### `print!` & `println!` ###
- Print stuff out. Yay.
- Use `{}` for general string interpolation, and `{:?}` for debug printing.

```rust
print!("{}, {}, {}", "foo", 3, true);
// foo, 3, true
println!("{:?}, {:?}", "foo", [1, 2, 3]);
// "foo", [1, 2, 3]
```

---
### `format!` ###
- Uses `println!`-style string interpolation to create formatted `String`s.

```rust
let formatted = format!("{}, {:x}, {:?}", 12, 15, Some("Hello"));
// formatted == "12, f, Some("Hello")"
```

---
### `panic!(msg)`
- Exits current task with given message. Similar to segfaulting.
- Don't do this lightly! It is better to handle and report errors explicitly.

```rust
if x < 0 {
    panic!("Oh noes!");
}
```

---
#### `assert!(bool)` & `assert_eq!(expected, actual)`
- `panic!`s if `bool` is false or `expected != actual`.
- Useful for testing and catching illegal conditions.

```rust
#[test]
fn test_something() {
    let actual = 1 + 2;
    assert_eq!(3, actual);
    assert!(actual == 3);
}
```

---
### `unreachable!()`

- Used to indicate that some code should not be reached
- Panics when reached
- Can be useful to track down unexpected bugs (e.g. optimization bugs)

```rust
if false {
    unreachable!();
}
```

---
### `unimplemented!()`

- Shorthand for `panic!("not yet implemented")`
- You'll probably see this in your homework a lot!

```rust
fn sum(x: Vec<i32>) -> i32 {
    // TODO
    unimplemented!();
}
```

---
### Match statements ###
```rust
let x = 3;

match x {
    1 => println!("one fish"),
    2 => {
        println!("two fish")
        println!("two fish")
    },
    _ => println!("no fish for you"),
}
```
*Notes:*
- `match` takes an expression (`x`) and branches on a list of `value => expression` statements.
- The entire match evaluates to one expression.
    - Like if statements, all arms must evaluate to an expression of the same type.
- A single expression should end with a comma.
- Multiple lines need braces (comma optional).
- `_` represents the wildcard pattern (similar to Haskell, OCaml).

---
### Match statements ###
```rust
let x = 3;
let y = -3;

match (x, y) {
    (1, 1) => println!("one"),
    (2, _) => println!("two"),
    (_, 3) => println!("three"),
    (i, j) if i > 5 && j < 0 => println!("On guard!"),
    (_, _) => println!(":<"),
}
```

- The matched expression can be any expression, including tuples and function calls.
- You _must_ have an exhaustive match; the compiler will complain if you don't.
- Use `if`-guards to match on certain conditions instead of specific values.
- Patterns are very complex, as we'll see later.

---
# Rust Environment & Tools

---
## Rustc ##

- Rust's compiler is `rustc`.
- Run `rustc your_program.rs` to compile into an executable `your_program`.
    - Things like warnings are enabled by default.
    - Read all of the output! It may be verbose but it is *very* useful.
- Typically, you'll use `cargo`, Rust's package manager, to build instead.

---
## Cargo ##

- Rust's package manager & build tool
- Create a new project:
    - `cargo new project_name` (library)
    - `cargo new project_name --bin` (executable)
- Build your project: `cargo build`
- Run your tests: `cargo test`
    - These get tedious to type, so shell alias to your heart's content: `cargob`/`cb` and `cargot`/`ct`
- Magic, right? How does this work?

---
### Cargo.toml ###

- Cargo uses a TOML ("Tom's Obvious, Minimal Language") file named
  Cargo.toml to declare and manage dependencies and project metadata.
- Build targets are determined by module declarations in `main.rs`/`lib.rs`.

- More in your first homework.

```toml
[package]
name = "Rust"
version = "0.1.0"
authors = ["Ferris <cis198@seas.upenn.edu>"]

[dependencies]
uuid = "0.1"
rand = "0.3"

[profile.release]
opt-level = 3
debug = false
```

---
## `cargo test`

- A test is any function which has been annotated with `#[test]`.
- `cargo test` will run all annotated functions in your project.
- Any function which executes without crashing (`panic!`ing) succeeds.
- Use `assert!` (or `assert_eq!`) to check conditions (and `panic!` on failure)

- More in your first homework.

```rust
#[test]
fn it_works() {
    // ...
}
```

---
## HW00: Installation

- Due 1/25.
- Install `multirust`: manages installations of multiple versions of Rust.
    - Similar to `rvm`, `virtualenv`.
    - Linux, OS X, Windows (MSYS2)
- Install 1.5 now if you want (updating is easy).
    - 1.6 comes out tomorrow!
- Submitting with Classroom for GitHub is as easy as ~~pie~~ pushing to your private repo.

---
## HW01: Finger Exercises

- Due 1/27.
- Get to know Rust with some easy exercises.
- Sieve of Eratosthenes, Tower of Hanoi

---
## Next Time ##
![Next time, baby](img/next_time.jpg)

- Ownership, references, borrowing
- Structed data: structs, enums
- Methods

Some code examples taken from [_The Rust Programming Language_](https://doc.rust-lang.org/stable/book/).
