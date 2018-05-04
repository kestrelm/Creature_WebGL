CC = emcc
MP_CPP_FILES = $(wildcard mp.cpp)
PACK_CPP_FILES = $(wildcard CreaturePackManager.cpp)
INCLUDES = -I$(CURDIR)
EOPT = WASM=1 "BINARYEN_METHOD='native-wasm'" ALLOW_MEMORY_GROWTH=1 TOTAL_MEMORY=524288000
EOPTS = $(addprefix -s $(EMPTY), $(EOPT))	# Add '-s ' to each option
OBJS = mpcppfiles.o packcppfiles.o
CXX_OPTS = -std=c++14 -O2 --bind
LINKER_OPTS = -O2 --bind

mpcppfiles.o: $(MP_CPP_FILES)
	$(CC) $(MP_CPP_FILES) $(EOPTS) $(INCLUDES) $(DEFINES) $(CXX_OPTS) -o mpcppfiles.o

packcppfiles.o: $(PACK_CPP_FILES)
	$(CC) $(PACK_CPP_FILES) $(EOPTS) $(INCLUDES) $(DEFINES) $(CXX_OPTS) -o packcppfiles.o

all: $(OBJS)
	$(CC) $(OBJS) $(EOPTS) $(LINKER_OPTS) -g -o creaturepack-wasm.html 

# Cleans up object files and build directory
clean:
		del *.o
		del *.wast
		del *.wasm
