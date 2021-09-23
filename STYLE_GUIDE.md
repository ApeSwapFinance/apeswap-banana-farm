# Style Guide

https://docs.soliditylang.org/en/v0.8.7/style-guide.html 

## Order of Layout

**Layout contract elements in the following order:**
1. Pragma statements
2. Import statements
3. Interfaces
4. Libraries
5. Contracts

**Inside each contract, library or interface, use the following order:**
1. Type declarations
2. State variables
3. Events
4. Functions

**Order of functions:**
1. constructor
2. receive function (if exists)
3. fallback function (if exists)
4. external
    1. standard
    2. view
    3. pure
5. public
6. internal
7. private