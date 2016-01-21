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

- When a variable binding is introduced, it _takes ownership_ of its data.
    - Data can only have one owner at a time.
- When a binding goes out of scope, the bound data will be released automatically.
    - For heap-allocated data, this means de-allocation.
- Data _must be guaranteed_ to live at least as long as its references.

```rust
fn foo() {
    // Creates a Vec object.
    // Gives ownership of the Vec object to v1.
    let v1 = vec![1, 2, 3];

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
    - So: move the Vec's ownership into `v2`, and declare `v1` invalid.
- `println!("{}", v1[2]);`
    - We know that `v1` is no longer a valid variable binding, so this is an error.
- Rust can reason about this at compile time, so it throws a compiler error.

---
## Move Semantics

- Moving ownership is semantic; it doesn't involve moving data.
- idk.

---
## Ownership

- Ownership does not always have to be moved.
- What would happen if it did? Rust would get very tedious to write:
```rust
fn vector_length(v: Vec<i32>) -> Vec<i32> {
        // Do whatever here, and then hand `v` back to the caller
}
```
- You could imagine that this does not scale well either; the more variables
    you had to hand back, the longer your return type would be!
    - Imagine having to pass ownership around for 5+ variables at a time :(

---
## Borrowing

- Instead of constantly transferring ownership, we can _borrow_ data.
- A variable's data can be borrowed by taking references to the variable;
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
fn length(vec_ref: &Vec<i32>) {
    // Dereference vec_ref to call methods on it.
    (*vec_ref).len();
}

fn main() {
    let vector = vec![];
    length(&vector);
    println!("{:?}", *vector);
}
```
- Note the type of `length`: `vec_ref` is passed by reference, so it's now an `&Vec<i32>`.
- References, like bindings, are *immutable* by default.
- When you take a variable by reference, you must dereference it with `*` before
  you use it (just like your old friend C).

---
## Borrowing

```rust
/// `push` needs to modify `vector` so it is borrowed mutably.
fn push(vec_ref: &mut Vec<i32>, x: i32) {
    let vector = *vec_ref;
    vector.push(x);
}

fn main() {
    let vector = vec![];
    push(&mut v, 4);
}
```
- Variables can be borrowed by _mutable_ reference: `&mut vec_ref`.
    - `vec_ref` is a reference to a mutable `Vec`.

---
### `Copy` Types

- Rust defines a trait&sup1; named `Copy` that signifies that a type may be
    copied instead whenever it would be moved.
- Most primitive types are `Copy` (`i32`, `f64`, `char`, `bool`, etc.)
- Types that contain references may not be `Copy` (e.g. `Vec`)
```rust
let x: i32 = 12;
let y = x; // `i32` is `Copy`, so it's not moved :D
println!("x still works: {}, and so does y: {}", x, y);
```

&sup1;for now, think Java interface or Haskell typeclass

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
    ```rust
    let mut vs = vec![1,2,3,4];
    for v in &vs {
        vs.pop();
        // ERROR: cannot borrow `vs` as mutable because
        // it is also borrowed as immutable
    }
    ```
- This pattern is valid in C, C++, Java, Python, Javascript...

---
### Borrowing Prevents...

- Use-after-free
    ```rust
    let y: &i32;
    {
        let x = 5;
        y = &x; // error: `x` does not live long enough
    }
    println!("{}", *y);
    ```
- Valid in C, C++...
- The full error message:
```
error: `x` does not live long enough
note: reference must be valid for the block suffix following statement 0 at 1:16
...but borrowed value is only valid for the block suffix following statement 0 at 4:18
```
- This eliminates a _huge_ number of memory safety bugs _at compile time_

---
## Lifetimes

- There's one more piece to the ownership puzzle: Lifetimes
- However, these are quite complicated and deserve more time than we'll give
   them today, so we'll leave them out for the time being

---
## Example: Vectors

You can iterate over `Vec`s in three different ways:

```rust
let mut vs = vec![0,1,2,3,4,5,6];

// Borrow immutably
for v in &vs { // Can also write `for v in vs.iter()`
    println!("I'm borrowing {}.", v);
    println!("You have to dereference `v` to use it (sometimes):"
    println!("{}", *v + 1);
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
## Example: Linked Lists ##

- Who likes linked lists?
