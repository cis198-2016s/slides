# Standard Library

### CIS 198 Lecture 5

## Iterators

- Seen in homework 3!
- Three variant methods:
    - `iter()` for an immutable borrow iterator.
    - `iter_mut()` for a mutable borrow iterator.
    - `into_iter()` for an ownership-passing iterator.
- Nothing new here...

---
## Iterator Consumers

- Consumers operate on an iterator & return one or more values.
- There are like a billion of these, so let's look at a few.

<img src="img/consume.png" style="width: 1000px;"/>

###### Photo credit: [Hal Hefner](http://halhefner.com/)

---
## Preface: Type Transformations

- Many iterator manipulators take an `Iterator` and return some other, unrelated
    type
    - e.g. `map` returns a `Map`, `filter` returns a `Filter`
- Generally, don't worry about what these types are, or what they contain.
- The type transformations are used mostly to enforce type safety.

---
## `collect`

- `collect()` takes an iterator and rolls it back into a new collection.
- The object iterated over must define the `FromIterator` trait for the `Item`
    inside the `Iterator`.
- `collect()` sometimes needs a type hint to properly compile:

```rust
let vs = vec![1,2,3,4];
// What type is this?
let set = vs.iter().collect();
// Hint to `collect` that we want a HashSet back.
// Note the lack of an explicit <i32>.
let set: HashSet<_> = vs.iter().collect();
// Alternate syntax!
let set = vs.iter().collect::<HashSet<i32>>();
```

---
## `fold`

```rust
fn fold<B, F>(self, init: B, f: F) -> B
    where F: FnMut(B, Self::Item) -> B;

let vs = vec![1,2,3,4,5];
let sum = vs.iter().fold(0, |acc, &x| acc + x);
assert_eq!(sum, 15);
```

- `fold` "folds up" an iterator into a single value.
    - Sometimes called `reduce` or `inject` in other languages.
- `fold` takes two arguments:
    - An initial value or "accumulator" (`acc` above) of type `B`.
    - A function that takes a `B` and the type inside the iterator (`Item`) and
        returns a `B`.
- Rust doesn't do tail-recursion, so `fold` is implemented iteratively.
    - [See here](https://github.com/rust-lang/rust/issues/217) if you're interested why.

---
## `filter`

```rust
fn filter<P>(self, predicate: P) -> Filter<Self, P>
    where P: FnMut(&Self::Item) -> bool;
```

- `filter` takes a predicate function `P` and removes anything that doesn't pass
    the predicate.
- `filter` returns a `Filter<Self, P>`, so you need to `collect` it to get a new
    collection.

---
## `find` & `position`

```rust
fn find<P>(&mut self, predicate: P) -> Option<Self::Item>
    where P: FnMut(Self::Item) -> bool;

fn position<P>(&mut self, predicate: P) -> Option<usize>
    where P: FnMut(Self::Item) -> bool;
```

- Try to find the first item in the iterator that matches the `predicate` function.
- `find` returns the item itself.
- `position` returns the item's index.
- On failure, both return a `None`.

---
## `skip`

---
## `zip`

```rust
fn zip<U>(self, other: U) -> Zip<Self, U::IntoIter>
    where U: IntoIterator;
```

- Takes two iterators and zips them into a single iterator.
- Invoked like `a.iter().zip(b.iter())`.
    - Returns pairs of items like `(ai, bi)`.
- The shorter iterator of the two wins for stopping iteration.

---
## `any` & `all`

```rust
fn any<F>(&mut self, f: F) -> bool
    where F: FnMut(Self::Item) -> bool;

fn all<F>(&mut self, f: F) -> bool
    where F: FnMut(Self::Item) -> bool;
```

- `any` tests if any element in the iterator matches the input function
- `all` tests all elements in the iterator match the input function
- Logical OR vs. logical AND.

---
## `enumerate`

```rust
fn enumerate(self) -> Enumerate<Self>;
```

- Want to iterate over a collection by item and index?
- Use `enumerate`!
- This iterator returns `(index, value)` pairs.
    - `index` is the `usize` index of `value` in the collection

---
## Iterator Adapters

- Adapters operate on an iterator & return a new iterator.
- Adapters are often _lazy_  -- they don't evaluate unless you force them to!
- You must explicitly call some iterator consumer on an adapter or use it in a
    `for` loop etc. to cause it to evaluate

---
## `map`

```rust
fn map<B, F>(self, f: F) -> Map<Self, F>
    where F: FnMut(Self::Item) -> B;

let vs = vec![1,2,3,4,5];
let twice_vs: Vec<_> = vs.iter().map(|x| x * 2).collect();
```

- `map` takes a function and creates an iterator that calls the function on each
    element
- Abstractly, it takes a `Collection<A>` and a function of type `A -> B` and
    returns a `Collection<B>`
    - (`Collection` is not a real type)

---
## `take` & `take_while`

```rust
fn take(self, n: usize) -> Take<Self>;

fn take_while<P>(self, predicate: P) -> TakeWhile<Self, P>
    where P: FnMut(&Self::Item) -> bool;
```

- `take` creates an iterator that yields its first `n` elements.
- `take_while` takes a closure as an argument, and iterates until the closure
    returns `false`.
- Can be used on infinite ranges to produce finite enumerations:

```rust
for i in (0..).take(5) {
    println!("{}", i); // Prints 0 1 2 3 4
}
```

---
## Alternative Iterators
// Drain etc.

---
## String Types

- Rust strings are complicated.
    - Sequences of Unicode values encoded in UTF-8.
    - Not null-terminated and may contain null bytes.
- There are two kinds: `&str` and `String`.

---
## `&str`

- `&str` is a string slice (like array slice).
- `"string literals"` are of type `&str`. *
- `&str`s are statically-allocated & fixed-size.
- May not be indexed like `some_str[i]`, as each character may be multiple bytes
    due to Unicode.
    - However, may be iterated with `chars()` or indexed by bytes.
- As with all Rust references, they have an associated lifetime.

*More specifically, they have the type `&'static str`.

---
## `String`

- `String`s are heap-allocated, and are dynamically growable.
    - Like `Vec`s in that regard.
    - In fact, `String` is just a wrapper over `Vec<u8>`!
- Just like `&str`, also cannot be indexed.
- May be created with `String::new()`, `"foo".to_string()`, or
    `String::from("bar")`.
- May be coerced into an `&str` by taking a reference to the `String`.

---
## String Conversion

- A `String` and an `&str` may be concatenated with `+`:

```rust
let course_code = "CIS".to_string();
let course_name = course_code + " 198";
```

- Concatenating two `String`s requires coercing one to `&str`:

```rust
let course_code = "CIS".to_string();
let course_num = " 198".to_string();
let course_name = course_code + &course_num;
```

---
## `String` & `&str`: Why?

// TODO

---
## Option<T>

```rust
enum Option<T> {
    None,
    Some(T),
}
```

- Provides a concrete type to the concept of nothingness.
- Use this instead of returning `NaN`, `-1`, `null`, etc. from a function.
- No restrictions on what `T` may be.

---
## Option<T>

```rust
fn sqrt(x: f64) -> Option<f64> {
    if x < 0 {
        None
    } else {
        Some(std::f64::sqrt(x))
    }
}

let x = 100.0;
match sqrt(x) {
    None => println!("Invalid sqrt."),
    Some(root) => println!("sqrt: {}.", root),
}
```

---
## Option<T>

- Often, you'll interact with `Option` by destructuring it using
    `if-let`/`match`.
- `Option<T>`s may be converted to `T`s using the `unwrap()` method 🎁.
    - However, this may `panic!` at runtime, so don't do this lightly!
    - Better, though still dangerous: `expect(message)` unwraps or provides a helpful
        panic message.
- `Option`s can also be unwrapped safely using `unwrap_or`/`unwrap_or_else`,
    which allow you to provide a default value in case of failure.
- Any `Option` can be swapped out for `None` using `take`.
- Can be combined with other `Option`s using `and` and `or`.
    - Logically, `Some(_)` works like `true`, `None` like `false`.

---
## Result<T, E>

```rust
enum Result<T, E> {
    Ok(T),
    Err(E)
}
```

- `Result` is like `Option`, but it also encodes an `Err` type.
- The type contained by `Ok` and `Err` do not have to be the same!
- Rust's stdlib often defines aliases over `Result` for error handling:

```rust
// Actually returns a `Result<usize, std::io::Error>`
fn std::io::read_line(&self, buf: &mut String)
    -> std::io::Result<usize>
```

---
## Result<T, E>

- Also often interacted with via `if-let`!
- Also define `unwrap` and `expect` methods.
- Can be converted to an `Option` using `ok()` or `err()`.
- Can be operated on in almost all the same ways as `Option`
    - `and`, `or`, `unwrap`, etc.
- Unlike `Option`, a `Result` should _always_ be consumed.
    - If a function returns a `Result`, you should be sure to `unwrap`/`expect`
        it, or otherwise handle the `Ok`/`Err` in a meaningful way.
    - The compiler warns you if you don't.
    - Not using a result could result (ha) in your program unintentionally
        crashing!

---
## [Collections](https://doc.rust-lang.org/stable/std/collections/)

<img src="img/collector.jpg" style="width: 1000px;"/>

---
## `Vec<T>`

- Nothing new here.

---
## `VecDeque<T>`

- An efficient double-ended `Vec`.
- Implemented as a ring buffer.

---
## `LinkedList<T>`

- A doubly-linked list.
- Even if you want this, you probably don't want this.

---
## `HashMap<K,V>`/`BTreeMap<K,V>`

- Map/dictionary types
- `HashMap<K, V>` is useful when you want a basic map
    - Requires that `K` is `Hash + Eq`
    - Uses "linear probing with Robin Hood bucket stealing"
- `BTreeMap<K, V>` is useful when you want a sorted map (with slightly worse performance)
    - Requires that `K` is `Ord`
    - Uses a B-tree under the hood (surprise surprise)

---
## `HashSet<T>`/`BTreeSet<T>`

- Sets for storing unique values.
- `HashSet<T>` and `BTreeSet<T>` are literally struct wrappers for `HashMap<T, ()>` and `BTreeMap<T, ()>`.
- Same tradeoffs and requirements as their Map variants.

---
## `BinaryHeap<T>`

- A priority queue implemented with a binary max-heap.

---
