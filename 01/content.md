# Ownership & Lifetimes

### CIS 198 Lecture 1

---
## Ownership & Borrowing

- Explicit ownership is the biggest new feature that Rust brings to the table!
- Ownership is all&sup1; checked at compile time!
- Newcomers to Rust often find themselves "fighting with the borrow checker"
   trying to get their code to compile

&sup1;*mostly*

---
## Ownership

- A variable binding _takes ownership_ of its data.
    - A piece of data can only have one owner at a time.
- When a binding goes out of scope, the bound data is released automatically.
    - For heap-allocated data, this means de-allocation.
- Data _must be guaranteed_ to outlive its references.

```rust
fn foo() {
    // Creates a Vec object.
    // Gives ownership of the Vec object to v1.
    let mut v1 = vec![1, 2, 3];

    v1.pop();
    v1.push(4);

    // At the end of the scope, v1 goes out of scope.
    // v1 still owns the Vec object, so it can be cleaned up.
}
```

---
## Move Semantics

```rust
let v1 = vec![1, 2, 3];

// Ownership of the Vec object moves to v2.
let v2 = v1;

println!("{}", v1[2]); // error: use of moved value `v1`
```

- `let v2 = v1;`
    - We don't want to copy the data, since that's expensive.
    - The data cannot have multiple owners.
    - Solution: move the Vec's ownership into `v2`, and declare `v1` invalid.
- `println!("{}", v1[2]);`
    - We know that `v1` is no longer a valid variable binding, so this is an error.
- Rust can reason about this at compile time, so it throws a compiler error.

---
## Move Semantics

- Moving ownership is semantic; it doesn't involve moving data under the hood.
    - Again, since moves are computed at compile time, data does not need to be
        invalidated at runtime, since it's guaranteed not to be used. // TODO Reword
        this.
- Moves are implicit; no need to use something like C++'s `std::move`.

---
## Ownership

- Ownership does not always have to be moved.
- What would happen if it did? Rust would get very tedious to write:
```rust
fn vector_length(v: Vec<i32>) -> Vec<i32> {
        // Do whatever here,
        // then return ownership of `v` back to the caller
}
```
- You could imagine that this does not scale well either.
    - The more variables you had to hand back, the longer your return type would be!
    - Imagine having to pass ownership around for 5+ variables at a time :(

---
## Borrowing

- Instead of transferring ownership, we can _borrow_ data.
- A variable's data can be borrowed by taking a reference to the variable;
  ownership doesn't change.
- Ownership cannot be transferred from a variable while references to the data
  exist.

```rust
fn foo() {
    let v = vec![1, 2, 3];

    // v_ref is a reference to v.
    let v_ref = &v;

    // Moving ownership to v_new would invalidate v_ref.
    // error: cannot move out of `v` because it is borrowed
    let v_new = v;
}
```

---
## Borrowing

```rust
/// `length` only needs `vector` temporarily, so it is borrowed.
fn length(vec_ref: &Vec<i32>) -> usize {
    // vec_ref is auto-dereferenced when you call methods on it.
    vec_ref.len()
    // you can also explicitly dereference.
    // (*vec_ref).len()
}

fn main() {
    let vector = vec![];
    length(&vector);
    println!("{:?}", vector); // this is fine
}
```
- Note the type of `length`: `vec_ref` is passed by reference, so it's now an `&Vec<i32>`.
- References, like bindings, are *immutable* by default.
- The borrow is over after the reference goes out of scope (the function `length`).

---
## Borrowing

```rust
/// `length` only needs `vector` temporarily, so it is borrowed.
fn length(vec_ref: &&Vec<i32>) -> usize {
    // vec_ref is auto-dereferenced when you call methods on it.
    vec_ref.len()
}

fn main() {
    let vector = vec![];
    length(&&&&&&&&&&&&vector);
}
```
- Rust will auto-dereference variables...
    - When making method calls on a reference.
    - When passing a reference as a function argument.

---
## Borrowing

```rust
/// `push` needs to modify `vector` so it is borrowed mutably.
fn push(vec_ref: &mut Vec<i32>, x: i32) {
    vec_ref.push(x);
}

fn main() {
    let mut vector: Vec<i32> = vec![];
    let vector_ref: &mut Vec<i32> = &mut vector;
    push(vector_ref, 4);
}
```
- Variables can be borrowed by _mutable_ reference: `&mut vec_ref`.
    - `vec_ref` is a reference to a mutable `Vec`.
    - The type is `&mut Vec<i32>`, not `&Vec<i32>`.

---
## Borrowing

```rust
/// `push` needs to modify `vector` so it is borrowed mutably.
fn push2(vec_ref: &mut Vec<i32>, x: i32) {
    // error: cannot move out of borrowed content.
    let vector = *vec_ref;
    vector.push(x);
}

fn main() {
    let mut vector = vec![];
    push(&mut vector, 4);
}
```
- Error! You can't dereference `vec_ref` into a variable binding because that
  would change the ownership of the data.

---
## `ref`

```rust
let mut vector = vec![0];
let ref1 = &vector;
let ref ref2 = vector;
assert_eq!(ref1, ref2);

let ref mut ref3 = vector;
ref3.push(1);
```

- `ref` is a keyword that takes a reference to the lvalue.
    - Take a mutable reference with `ref mut`.
- This is most useful in `match` statements when destructuring patterns.
    - Otherwise, it's more clear to use `&`.

---
## `ref`

```rust
let mut vectors = (vec![0], vec![1]);
match vectors {
    (ref v1, ref mut v2) => {
        v1.len();
        v2.push(2);
    }
}
```
- Use `ref` and `ref mut` when binding variables inside match statements.

---
## `Copy` Types

- Rust defines a trait&sup1; named `Copy` that signifies that a type may be
    copied instead whenever it would be moved.
- Most primitive types are `Copy` (`i32`, `f64`, `char`, `bool`, etc.).
- Types that contain references may not be `Copy` (e.g. `Vec`, `String`).
```rust
let x: i32 = 12;
let y = x; // `i32` is `Copy`, so it's not moved :D
println!("x still works: {}, and so does y: {}", x, y);
```

&sup1;Java interface or Haskell typeclass

---
## Borrowing Rules
### _The Holy Grail of Rust_
Learn these rules, and they will serve you well.

- Any borrow must last for a scope no greater than that of the owner of the data
- You may have as many immutable references to a resource at once as you want (`&T`)
- OR you may have _exactly one_ mutable reference to a resource (`&mut T`)
- That's it!

![](img/holy-grail.jpg)

---
### Borrowing Prevents...

- Iterator invalidation due to mutating a collection you're iterating over.
- This pattern is valid in C, C++, Java, Python, Javascript...
```rust
let mut vs = vec![1,2,3,4];
for v in &vs {
    vs.pop();
    // ERROR: cannot borrow `vs` as mutable because
    // it is also borrowed as immutable
}
```

---
### Borrowing Prevents...

- Use-after-free
- Valid in C, C++...
```rust
let y: &i32;
{
    let x = 5;
    y = &x; // error: `x` does not live long enough
}
println!("{}", *y);
```
- The full error message:
```
error: `x` does not live long enough
note: reference must be valid for the block suffix following statement
    0 at 1:16
...but borrowed value is only valid for the block suffix
    following statement 0 at 4:18
```
- This eliminates a _huge_ number of memory safety bugs _at compile time_.

---
## Example: Vectors

- You can iterate over `Vec`s in three different ways:

```rust
let mut vs = vec![0,1,2,3,4,5,6];

// Borrow immutably
for v in &vs { // Can also write `for v in vs.iter()`
    println!("I'm borrowing {}.", v);
}

// Borrow mutably
for v in &mut vs { // Can also write `for v in vs.iter_mut()`
    *v = *v + 1;
    println!("I'm mutably borrowing {}.", v);
}

// Take ownership
for v in vs { // Can also write `for v in vs.into_iter()`
    println!("I now own {}! AHAHAHAHA!", v);
}
```

---
## Lifetimes

- There's one more piece to the ownership puzzle: Lifetimes.
- Lifetimes generally have a pretty steep learning curve.
  - We may cover them again later on in the course under a broader scope if
      necessary.
- Don't worry if you don't understand these right away.

---
## Lifetimes

- Imagine This:
  1. I acquire a resource.
  2. I lend you a reference to my resource.
  3. I decide that I'm done with the resource, so I deallocate it.
  4. You still hold a reference to the resource, and decide to use it.
  5. You crash 😿.
- We've already said that Rust makes this scenario impossible, but glossed over
    how.
- We need to prove to the compiler that _step 3_ will never happen before _step 4_.

---
## Lifetimes

- Ordinarily, references have an implicit lifetime that we don't need to care
    about.
- However, we can explicitly provide one like so.
- `'a`, pronounced "tick-a" or "the lifetime 'a'" is an explicit lifetime
    annotating `x`.
- `<'a>` is a list of all lifetimes used in `bar`.

```rust
// implicit
fn foo(x: &i32) {
  // ...
}

// explicit
fn bar<'a>(x: &'a i32) {
  // ...
}
```

---
## Lifetimes

- The compiler is smart enough not to need `'a` above, but this isn't always the
    case
- Scenarios that involve multiple references or returning references often
    require explicit lifetimes.
  - Speaking of which...

---
## Lifetimes - Multiple Lifetimes

- Functions that use multiple references may use the same lifetime for all
    references.
- However, sometimes it's useful to give the references different lifetimes.
- In `x_or_y`, both input references and the output reference have the same
    lifetime
- In `p_or_q`, `p` and the output reference have the same lifetime.
  - `q` has an unrelated lifetime

```rust
fn x_or_y<'a>(x: &'a str, y: &'a str) -> &'a str {
  // ...
}

fn p_or_q<'a, 'b>(p: &'a str, q: &'b str) -> &'a str {
  // ...
}
```

---
## Lifetimes - 'static

- There is one reserved, special lifetime, named `'static`.
- `'static` indicates to the compiler that something has the lifetime of the
    entire program
- All `&str` literals have the `'static` lifetime.

```rust
let s1: &str = "Hello";
let s2: &'static str = "World";
```
