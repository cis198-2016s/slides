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
    pub fn new(_x: i32, _y: i32) -> Point {
        Point { x: _x, y: _y }
    }
}
```

- `new` is inside the same module, so this is fine.

---
### Struct `match` Statement

```rust
pub struct Point {
    x: i32,
    y: i32,
}

let p = Point { x: 1, y: 2 };
match p {
    Point { x, y } => println!("({}, {})", x, y)
}

match p {
    Point { x: x1, y: y1 } => println!("({}, {})", x1, y1)
}
```

- Destructure structs with `match` statements.
- You can rename struct fields inside arms.

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
- You can destructure these with a `match` statement.

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
- Rust enums are much more powerful than in Java/C/C++/Python...
- Enum variants can have:
    - no data (unit struct)
    - unnamed ordered data (tuple struct)
    - named data (struct)

```rust
enum Result {
    Ok,
    Warning { code: i32, message: String },
    Err(String)
}
```

---
## Enums

- Enum variants are namespaced by their enum type: `Result::Ok`.
    - You can import all variants with `use Result::*`.
- Enums, much as you'd expect, can be matched on like any other data type.

```rust
match make_request() {
    Result::Ok => println!("Success!"),
    Result::Warning { code, message } => println!("Warning: {}!", message),
    Result::Err(s) => println!("Failed with error: {}", s),
};
```

---
## Enums

- Enum constructors like `Result::Ok` and the like can be used as functions.
- This is not currently very useful, but will become so when we cover closures &
    iterators.

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
    - Favor this by default unless you need a different ownership model.
- `&mut self`: the method *mutably borrows* the struct.
- `self`: the method takes ownership.
    - e.g. consumes the struct and returns something else.

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
- `mirror_y` returns an entirely new struct.

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
- Methods (and associated functions) may not be overloaded.
    - e.g. `Vec::new()` and `Vec::with_capacity(capacity: usize)` are both
      constructors for `Vec`
- Methods may not be inherited.
    - Rust structs & enums must be composed instead.
    - However, traits (coming soon) have basic inheritance.
