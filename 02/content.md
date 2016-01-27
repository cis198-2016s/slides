# Structured Data

### CIS 198 Lecture 1.

---
## Structured Data

- Rust has two simple ways of creating structured data types:
    - Structs: C-like structs to hold data.
    - Enums: OCaML-like; data that can be one of several types.

- Struts and enums may have one or more implementation blocks (`impl`s) which
  define methods for the data type.

---
## Structs

- A struct declaration:
    - Fields are declared with `name: type`.

```rust
struct Point {
    x: i32,
    y: i32,
}
```

- By convention, structs have `CamelCase` names, and their fields have `snake_case` names.
- Structs may be instantiated with fields assigned in braces.

```rust
let origin = Point { x: 0, y: 0 };
```

---
## Structs

- Struct fields may be accessed with dot notation.
- Structs may not be partially-initialized.
    - You must assign all fields upon creation, or declare an uninitialized
      struct that you initialize later.

```rust
let mut p = Point { x: 19, y: 8 };
p.x += 1;
p.y -= 1;
```

---
## Structs

- Structs do not have field-level mutability.
- Mutability is a property of the variable binding, not of the datatype.
- Field-level mutability (interior mutability) can be achieved via `Cell` types
    - More on these very soon.

```rust
struct Point {
    x: i32,
    mut y: i32, // Illegal!
}
```

---
## Structs

- Structs are namespaced with the module name.
    - The fully qualified name of `Point` is `foo::Point`.
- Struct fields are private by default.
    - They may be made public with the `pub` keyword.
- Private fields may only be accessed from within the module where the struct is
    declared.

```rust
mod foo {
    pub struct Point {
        pub x: i32,
        y: i32,
    }
}

fn main() {
    let b = foo::Point { x: 12, y: 12 };
    //      ^~~~~~~~~~~~~~~~~~~~~~~~~~~
    // error: field `y` of struct `foo::Point` is private
}
```

---
## Structs

```rust
mod foo {
    pub struct Point {
        pub x: i32,
        y: i32,
    }

    // Creates and returns a new point
    pub fn new(x: i32, y: i32) -> Point {
        Point { x: x, y: y }
    }
}
```

- `new` is inside the same module as `Point`, so accessing private fields is
  allowed.

---
### Struct `match`ing

- Destructure structs with `match` statements.

```rust
pub struct Point {
    x: i32,
    y: i32,
}

match p {
    Point { x, y } => println!("({}, {})", x, y)
}
```

---
### Struct `match`ing

- Some other tricks for struct `match`es:

```rust
match p {
    Point { y: y1, x: x1 } => println!("({}, {})", x1, y1)
}

match p {
    Point { y, .. } => println!("{}", y)
}
```
- Fields do not need to be in order.
- List fields inside braces to bind struct members to those variable names.
    - Use `struct_field: new_var_binding` to change the variable it's bound to.
- Omit fields: use `..` to ignore all unnamed fields.

---
### Struct Update Syntax

- A struct initializer can contain `.. s` to copy some or all fields from `s`.
- Any fields you don't specify in the initializer get copied over from the target struct.
- The struct used must be of the same type as the target struct.
    - No copying same-type fields from different-type structs!

```rust
struct Foo { a: i32, b: i32, c: i32, d: i32, e: i32 }

let mut x = Foo { a: 1, b: 1, c: 2, d: 2, e: 3 };
let x2 = Foo { e: 4, .. x };

// Useful to update multiple fields of the same struct:
x = Foo { a: 2, b: 2, e: 2, .. x };
```

---
### Tuple Structs

- Variant on structs that has a name, but no named fields.
- You can't access them on a per-field level.
- Can also `match` these.

```rust
struct Color(i32, i32, i32);

let c = Color(0, 255, 255);
match c {
    Color(r, g, b) => println!("({}, {}, {})", r, g, b)
}
```

---
### Tuple Structs

- Helpful if you want to create a new type that's not just an alias.
    - This is often referred to as the "newtype" pattern.
- These two types are structurally identical, but not equatable.

```rust
struct Meters(i32);
struct Yards(i32);
```

---
### Unit Structs (Zero-Sized Types)

- Structs can be declared to have zero size.
    - This struct has no fields!
- We can still instantiate it.
- It can be used as a "marker" type on other data structures.
    - Useful to indicate, e.g., the type of data a container is storing.

```rust
struct Unit;

let u = Unit;
```

---
## Enums

- An enum, or "sum type", is a way to express some data that may be one of several things.
- Much more powerful than in Java, C, C++, C#...
- Enum variants can have:
    - no data (unit struct)
    - unnamed ordered data (tuple struct)
    - named data (struct)

```rust
enum Resultish {
    Ok,
    Warning { code: i32, message: String },
    Err(String)
}
```

---
## Enums

- Enum variants are namespaced by their enum type: `Resultish::Ok`.
    - You can import all variants with `use Resultish::*`.
- Enums, much as you'd expect, can be matched on like any other data type.

```rust
match make_request() {
    Resultish::Ok =>
        println!("Success!"),
    Resultish::Warning { code, message } =>
        println!("Warning: {}!", message),
    Resultish::Err(s) =>
        println!("Failed with error: {}", s),
}
```

---
## Enums

- Enum constructors like `Resultish::Ok` and the like can be used as functions.
- This is not currently very useful, but will become so when we cover closures &
    iterators.

---
## Recursive Types

- Structs & enums exist on the stack by default, so they may not be recursive.
    - Such a definition would have infinite size at compile time!
- The compiler tells us how to fix this, but what's a `box`?

```rust
struct Node {
    x: i32,
    next: Node,
}
// error: invalid recursive struct type
// help: wrap the inner value in a box to make it representable
```

---
## Boxes, Briefly

- A `box` (lowercase) is a general term for one of Rust's ways of allocating data on the heap.
- A `Box<T>` (uppercase) is a heap pointer with exactly one owner.
    - A `Box` its data (the `T`) uniquely-- it can't be aliased.
- `Box`es are automatically destructed when they go out of scope.
- Create a `Box` with `Box::new()`:

```rust
let boxed_five = Box::new(5);

struct Node {
    x: i32,
    next: Box<Node>, // OK!
}
```
- We'll cover these in greater detail when we talk more about pointers.

---
## Methods

```rust
impl Point {
    pub fn distance(&self, other: Point) -> f32 {
        let (dx, dy) = (self.x - other.x, self.y - other.y);
        ((dx.pow(2) + dy.pow(2)) as f32).sqrt()
    }
}

fn main() {
    let p = Point { x: 1, y: 2 };
    p.distance();
}
```

- Methods can be implemented for structs and enums in an `impl` block.
- Like fields, methods may be accessed via dot notation.
- Can be made public with `pub`.
    - `impl` blocks themselves cannot be made `pub`.
- Work for enums in exactly the same way they do for structs.

---
## Methods

- The first argument to a method determines what kind of ownership the method
  requires.
- `&self`: the method *borrows* the struct.
    - Use this unless you need a different ownership model.
- `&mut self`: the method *mutably borrows* the struct.
    - The function needs to modify the struct it's called on.
- `self`: the method takes ownership.
    - e.g. the function consumes the struct and returns something else.

---
## Methods

```rust
impl Point {
    fn distance(&self, other: Point) -> f32 {
        let (dx, dy) = (self.x - other.x, self.y - other.y);
        ((dx.pow(2) + dy.pow(2)) as f32).sqrt()
    }

    fn translate(&mut self, x: i32, y: i32) {
        self.x += x;
        self.y += y;
    }

    fn mirror_y(self) -> Point {
        Point { x: -self.x, y: self.y }
    }
}
```

- `distance` needs to access but not modify fields.
- `translate` modifies the struct fields.
- `mirror_y` returns an entirely new struct, consuming the old one.

---
## Associated Functions

```rust
impl Point {
    fn new(x: i32, y: i32) -> Point {
        Point { x: x, y: y }
    }
}

fn main() {
    Point::new(1, 2);
}
```

- Associated function: a function for a type which does not take `self`.
    - This is called with namespacing syntax (`Point::new`) not member syntax.
    - Similar to "static methods".
- A constructor-like function is usually named `new`.
    - Rust does not have a notion of actual / automatic constructors.

---
## Implementations
- Methods, associated functions, and functions in general may not be overloaded.
    - e.g. `Vec::new()` and `Vec::with_capacity(capacity: usize)` are both
      constructors for `Vec`
- Methods may not be inherited.
    - Rust structs & enums must be composed instead.
    - However, traits (coming soon) have basic inheritance.

---
## Patterns

- Use `...` to specify a range of values. Useful for numerics and `char`s.
- Use `_` to bind against any value (like any variable binding) and discard the
  binding.

```rust
let x = 17;

match x {
    0 ... 5 => println!("zero through five (inclusive)"),
    _ => println!("You still lose the game."),
}
```

---
### `match`: References

- Get a reference to a variable by asking for it with `ref`.

```rust
let x = 17;

match x {
    ref r => println!("Of type &i32: {}", r),
}
```

- And get a mutable reference with `ref mut`.
    - Only if the variable was declared `mut`.

```rust
let mut x = 17;

match x {
    ref r if x == 5 => println!("{}", r),
    ref mut r => *r = 5
}
```
- Similar to `let ref`.

---
### `if-let` Statements

- If you only need a single match arm, it often makes more sense to use Rust's `if-let` construct.
- For example, given the `Resultish` type we defined earlier:

```rust
enum Resultish {
    Ok,
    Warning { code: i32, message: String },
    Err(String),
}
```

---
### `if-let` Statement
- Suppose we want to report an error but do nothing on `Warning`s and `Ok`s.

```rust
match make_request() {
    Resultish::Err(_) => println!("Total and utter failure."),
    _ => println!("ok."),
}
```

- We can simplify this statement with an `if-let` binding:

```rust
let result = make_request();

if let Resultish::Err(s) = result {
    println!("Total and utter failure: {}", s);
} else {
    println!("ok.");
}
```

---
### `while-let` Statement

- There's also a similar `while-let` statement, which works like an `if-let`,
   but iterates until its condition evaluates to false

```rust
while let Resultish::Err(s) = make_request() {
    println!("Total and utter failure: {}", s);
}
```

---
### Inner Bindings

- With more complicated data structures, use `@` to create variable bindings for
    inner elements.

```rust
enum Result {
    Ok,
    Warning { code: i32, message: String },
    Err(String),
}

match make_request() {
    Resultish::Ok(ref s @ _) => println!("Succeeded with value: {}!", value),
    Resultish::Err(_)        => println!("An error occurred."),
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

- Functions that use multiple references may use the same
  lifetime for all references.
- But sometimes it's useful to give references different lifetimes.
- In `x_or_y`, input/output references all have the same lifetime.
- In `p_or_q`, `p` and the output reference have the same lifetime.
  - `q` has a separate lifetime with no constrained relationship to `p`.

```rust
fn x_or_y<'a>(x: &'a str, y: &'a str) -> &'a str {
  // ...
}

fn p_or_q<'a, 'b>(p: &'a str, q: &'b str) -> &'a str {
  // ...
}
```

---
## Lifetimes

- Okay, great, but what does this all mean?
  - If a reference `R` has a lifetime `'a`, it is _guaranteed_ that it will not
      outlive the owner of its underlying data (the value at `*R`
  - If a reference `R` has a lifetime of `'a`, anything else with the lifetime
    `'a` is _guaranteed_ to live as long `R`.
- This will probably become more clear the more you use lifetimes yourself.

---
## Lifetimes - `struct`s

- Lifetimes can also be used to annotate `struct` members. (DEMO)

```rust
struct Pizza(Vec<i32>);
struct PizzaSlice<'a> {
    pizza: &'a Pizza,  // <- references in structs must
    index: u32,        //    ALWAYS have explicit lifetimes
}

let p1 = Pizza(vec![1, 2, 3, 4]);
{
    let s1 = PizzaSlice { pizza: &p1, index: 2 }; // this is okay
}

let s2;
{
    let p2 = Pizza(vec![1, 2, 3, 4]);
    s2 = PizzaSlice { pizza: &p2, index: 2 };
    // no good - why?
}
```

---
## Lifetimes - `struct`s

- Lifetimes can be constrained to "outlive" others.
    - Looks like a type constraint.

```rust
struct Pizza(Vec<i32>);
struct PizzaSlice<'a> { pizza: &'a Pizza, index: u32 }
struct PizzaConsumer<'a, 'b: 'a> { // says "b outlives a"
    slice: PizzaSlice<'a>, //< current eating this one
    pizza: &'b Pizza,      //< so we can get more pizza
}

fn get_another_slice(c: &mut PizzaConsumer, index: u32) {
    c.slice = PizzaSlice { pizza: c.pizza, index: index };
}

let p = Pizza(vec![1, 2, 3, 4]);
{
    let s = PizzaSlice { pizza: &p, index: 1 };
    let mut c = PizzaConsumer { slice: s, pizza: &p };
    get_another_slice(&mut c, 2);
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

---
### Structured Data With Lifetimes

- Any struct or enum that contains a reference must have an explicit lifetime.
- Normal lifetime rules otherwise apply.

```rust
struct Foo<'a, 'b> {
  v: &'a Vec<i32>,
  s: &'b str,
}
```

---
### Lifetimes in `impl` Blocks

- Implementing methods on `Foo` struct requires lifetime annotations too!
- You can read this block as "the implementation using the lifetimes `'a` and
    `'b` for the struct `Foo` using the lifetimes `'a` and `'b`."

```rust
impl<'a, 'b> Foo<'a, 'b> {
  fn new(v: &'a Vec<i32>, s: &'b str) -> Foo<'a, 'b> {
    Foo {
      v: v,
      s: s,
    }
  }
}
```
