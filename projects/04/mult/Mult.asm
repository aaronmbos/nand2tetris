// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
//
// This program only needs to handle arguments that satisfy
// R0 >= 0, R1 >= 0, and R0*R1 < 32768.

// Assign variables
// Need variable to store RAM[0], 1, 2 respectively

  @R1
  D=M

  @R0
  D=M

  @R2
  D=MI

// Begin loop
// RAM[0] will be number added to itself
// RAM[1] will be loop iteration
// RAM[2] will be the product

// while n <= RAM[1]
// {
//   RAM[2] = RAM[2] + [RAM0]
// }

