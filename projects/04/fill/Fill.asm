// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, the
// program clears the screen, i.e. writes "white" in every pixel.

(LOOP)
  @SCREEN
  D=A
  @addr
  M=D // addr = 16384 (screen's base address)

  @KBD
  D=M

  @KEYPRESS
  D;JGT

  @KEYUP
  D;JEQ
  
  @LOOP
  0;JEQ

(KEYUP)
(CLEAR)
  @addr
  D=M
  @KBD
  D=D-A
  @LOOP
  D;JEQ
  
  @addr
  A=M
  M=0  // RAM[addr]=1111111111111111

  @addr
  M=M+1 // addr = addr + 32
  @CLEAR
  0;JMP

  @LOOP
  0;JMP

(KEYPRESS)

(DRAW)
  @addr
  D=M
  @KBD
  D=D-A
  @LOOP
  D;JEQ
  
  @addr
  A=M
  M=-1  // RAM[addr]=1111111111111111

  @addr
  M=M+1 // addr = addr + 32
  @DRAW
  0;JMP

  @LOOP
  0;JMP
