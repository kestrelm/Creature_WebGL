import base64
import sys
import os

if __name__== "__main__":
    if(len(sys.argv) != 3):
        print("Usage: <input binary file> <output b64 text file>")

    readBytes = None
    with open(sys.argv[1], mode='rb') as file: # b is important -> binary
        readBytes = file.read()
    
    outputStr = base64.encodestring(readBytes)

    try:
        os.remove(sys.argv[2])
    except:
        pass

    textfile = open(sys.argv[2], 'w')
    textfile.write(outputStr)
    textfile.close()

    print("Wrote to b64 text file: %s" %(sys.argv[2]))


