# Mermaid Test

This file is for testing Mermaid diagram rendering.

## Flowchart

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant System
    User->>System: Send Request
    System->>System: Execute Process
    System-->>User: Return Response
```

## Regular Code Block

This is a regular code block and should not be rendered as a diagram:

```javascript
function hello() {
    console.log("Hello World");
}
```

## Class Diagram

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +bark()
    }
    class Cat {
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

