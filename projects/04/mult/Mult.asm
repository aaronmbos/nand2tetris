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

  @R1
  D=M
  @x
  M=D  // x = R1

  @R0
  D=M
  @y
  M=D  // y = R0

  @sum
  M=0 

(LOOP)
  // if (i==x) goto END
  @i
  D=M
  @x
  D=D-M
  @STOP
  D;JEQ

  // sum = sum + y
  @sum
  D=M
  @y
  D=D+M
  @sum
  M=D // sum = sum + y

  @i
  M=M+1

  @LOOP
  0;JMP

(STOP)
  @sum
  D=M
  @R2
  M=D // RAM[2] = sum

(END)
  @END
  0;JMP
// Begin loop
// RAM[0] will be number added to itself
// RAM[1] will be loop iteration
// RAM[2] will be the product

// for (i=0; i<n; i++)
// {
//   RAM[2] = RAM[2] + [RAM0]
// }

