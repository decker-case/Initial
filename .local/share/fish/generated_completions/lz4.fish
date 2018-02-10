# lz4
# Autogenerated from man page /usr/share/man/man1/lz4.1.gz
complete -c lz4 -s z -l compress --description 'Compress.'
complete -c lz4 -s d -l decompress -l uncompress --description 'Decompress.'
complete -c lz4 -s t -l test --description 'Test the integrity of compressed . lz4 files.'
complete -c lz4 -o 'b#' --description 'Benchmark mode, using # compression level. SS "Operation modifiers" .'
complete -c lz4 -s '#' --description 'Compression level, with # being any value from 1 to 16.'
complete -c lz4 -s f -l force --description 'This option has several effects: .'
complete -c lz4 -s c -l stdout -l to-stdout --description 'Force write to standard output, even if it is the console.'
complete -c lz4 -s m -l multiple --description 'Multiple input files.  Compressed file names will be appended a . lz4 suffix.'
complete -c lz4 -s r --description 'operate recursively on directories.'
complete -c lz4 -o 'B#' --description 'Block size [4-7](default : 7) .'
complete -c lz4 -o BD --description 'Block Dependency (improves compression ratio on small blocks) .'
complete -c lz4 -l frame-crc --description 'Select frame checksum (default:enabled) .'
complete -c lz4 -l content-size --description 'Header includes original size (default:not present) .'
complete -c lz4 -l sparse --description 'Sparse mode support (default:enabled on file, disabled on stdout) .'
complete -c lz4 -s l --description 'Use Legacy format (typically for Linux Kernel compression) .'
complete -c lz4 -s v -l verbose --description 'Verbose mode .'
complete -c lz4 -s q -l quiet --description 'Suppress warnings and real-time statistics; specify twice to suppress errors …'
complete -c lz4 -s h -s H -l help --description 'Display help/long help and exit .'
complete -c lz4 -s V -l version --description 'Display Version number and exit .'
complete -c lz4 -s k -l keep --description 'Preserve source files (default behavior) .'
complete -c lz4 -l rm --description 'Delete source files on successful compression or decompression .'
complete -c lz4 -o 'e#' --description 'Benchmark multiple compression levels, from b# to e# (included) .'

