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
// Need variable to store RAM[0], 1 respectively, sum

// Begin loop
// RAM[0] will be number added to itself
// RAM[1] will be loop iteration
// RAM[2] will be the product

// for (i=0; i<RAM[1]; i++)
// {
//   RAM[2] = RAM[2] + RAM[0]
// }

  @i
  M=0

  @sum
  M=0 

(LOOP)
  // if (i==R1) goto END
  @i
  D=M
  @R1
  D=D-M
  @END
  D;JEQ

  // sum = sum + R0
  @sum
  D=M
  @R0
  D=D+M
  @sum
  M=D 

  @i
  M=M+1

  @LOOP
  0;JMP

(END)
  @sum
  D=M
  @R2
  M=D // RAM[2] = sum
  
  @END
  0;JMP

