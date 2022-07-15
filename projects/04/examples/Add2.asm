// Program: Add2.asm
// Computes: RAM[2] = RAM[0] + RAM[1]
// Usage: Put values in RAM[0], RAM[1]

@1
D=M // D=RAM[1]

@0
D=D+M // D=D+RAM[0]

@2
M=D // RAM[2]=D

@6
0;JMP // END with infinite loop

