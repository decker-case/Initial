# zstd
# Autogenerated from man page /usr/share/man/man1/zstd.1.gz
complete -c zstd -s z -l compress --description 'Compress.'
complete -c zstd -s d -l decompress -l uncompress --description 'Decompress.'
complete -c zstd -s t -l test --description 'Test the integrity of compressed files.'
complete -c zstd -o 'b#' --description 'Benchmark file(s) using compression level # .'
complete -c zstd -l train --description 'Use FILEs as a training set to create a dictionary.'
complete -c zstd -s l -l list --description 'Display information related to a zstd compressed file, such as size, ratio, a…'
complete -c zstd -s '#' --description '# compression level [1-19] (default: 3) .'
complete -c zstd -l ultra --description 'unlocks high compression levels 20+ (maximum 22), using a lot more memory.'
complete -c zstd -l long --description 'enables long distance matching with # windowLog, if not # is not present it d…'
complete -c zstd -o 'T#' -l threads --description 'Compress using # threads (default: 1).'
complete -c zstd -s D --description 'use file as Dictionary to compress or decompress FILE(s) .'
complete -c zstd -l nodictID --description 'do not store dictionary ID within frame header (dictionary compression).'
complete -c zstd -s o --description 'save result into file (only possible with a single INPUT-FILE) .'
complete -c zstd -s f -l force --description 'overwrite output without prompting, and (de)compress symbolic links .'
complete -c zstd -s c -l stdout --description 'force write to standard output, even if it is the console .'
complete -c zstd -l sparse --description 'enable / disable sparse FS support, to make files with many zeroes smaller on…'
complete -c zstd -l rm --description 'remove source file(s) after successful compression or decompression .'
complete -c zstd -s k -l keep --description 'keep source file(s) after successful compression or decompression.'
complete -c zstd -s r --description 'operate recursively on dictionaries .'
complete -c zstd -l format --description 'compress and decompress in other formats.'
complete -c zstd -o h/-H -l help --description 'display help/long help and exit .'
complete -c zstd -s V -l version --description 'display version number and exit.'
complete -c zstd -s v --description 'verbose mode .'
complete -c zstd -s q -l quiet --description 'suppress warnings, interactivity, and notifications.'
complete -c zstd -s C -l check --description 'add integrity check computed from uncompressed data (default : enabled) .'
