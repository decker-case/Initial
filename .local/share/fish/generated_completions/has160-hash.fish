# has160-hash
# Autogenerated from man page /usr/share/man/man1/has160-hash.1.gz
complete -c has160-hash -l printf -l template --description 'To output all sums use the `-a\' option.'
complete -c has160-hash -s c -l check --description 'Check hash files specified by command line.'
complete -c has160-hash -s u -l update --description 'Update hash files specified by command line.'
complete -c has160-hash -s k -l check-embedded --description 'Verify files by crc32 sum embedded in their names.'
complete -c has160-hash -l torrent --description 'Create a torrent file for each processed file.'
complete -c has160-hash -s h -l help --description 'Help: print help screen and exit.'
complete -c has160-hash -s V -l version --description 'Version: print version and exit.'
complete -c has160-hash -s B -l benchmark --description 'Run benchmark for selected algorithm(s).'
complete -c has160-hash -s C -l crc32 --description 'CRC32: calculate and print CRC32 hash sum.'
complete -c has160-hash -l md4 --description 'MD4: calculate and print MD4 hash sum.'
complete -c has160-hash -s M -l md5 --description 'MD5: calculate and print MD5 hash sum.'
complete -c has160-hash -s H -l sha1 --description 'SHA1: calculate and print SHA1 hash sum.'
complete -c has160-hash -l sha224 -l sha256 -l sha384 -l sha512 --description 'Calculate specified SHA2 hash sum.'
complete -c has160-hash -l sha3-224 -l sha3-256 -l sha3-384 -l sha3-512 --description 'Calculate specified SHA3 hash sum.'
complete -c has160-hash -l tiger --description 'Tiger: calculate and print Tiger hash sum.'
complete -c has160-hash -s T -l tth --description 'TTH: calculate and print DC++ TTH sum.'
complete -c has160-hash -l btih --description 'BTIH: calculate and print BitTorrent Info Hash.'
complete -c has160-hash -s A -l aich --description 'AICH: calculate and print AICH hash.'
complete -c has160-hash -s E -l ed2k --description 'ED2K: calculate and print eDonkey 2000 hash sum.'
complete -c has160-hash -s L -l ed2k-link --description 'eDonkey link: calculate and print eDonkey link.'
complete -c has160-hash -s W -l whirlpool --description 'Whirlpool: calculate and print Whirlpool hash sum.'
complete -c has160-hash -s G -l gost --description 'GOST: calculate and print GOST R 34.'
complete -c has160-hash -l gost-cryptopro --description 'GOST-CRYPTOPRO: calculate and print CryptoPro version of the GOST R 34.'
complete -c has160-hash -l ripemd160 --description 'RIPEMD-160: calculate and print RIPEMD-160 hash sum.'
complete -c has160-hash -l has160 --description 'HAS-160: calculate and print HAS-160 hash sum.'
complete -c has160-hash -l snefru128 -l snefru256 --description 'SNEFRU: calculate and print SNEFRU-128/256 hash sums.'
complete -c has160-hash -l edonr256 -l edonr512 --description 'EDON-R: calculate and print EDON-R 256/512 hash sums.'
complete -c has160-hash -s a -l all --description 'Calculate all supported hash sums.'
complete -c has160-hash -l list-hashes --description 'List names of all supported hashes, one per line.'
complete -c has160-hash -s r -l recursive --description 'Process directories recursively.'
complete -c has160-hash -s v -l verbose --description 'Be verbose.'
complete -c has160-hash -l percents --description 'Show percents, while calculating or checking sums.'
complete -c has160-hash -l skip-ok --description 'Don\'t print OK messages for successfully verified files.'
complete -c has160-hash -s i -l ignore-case --description 'Ignore case of filenames when updating crc files.'
complete -c has160-hash -l speed --description 'Print per-file and the total processing speed.'
complete -c has160-hash -s e -l embed-crc --description 'Rename files by inserting crc32 sum into name.'
complete -c has160-hash -l embed-crc-delimiter --description 'Insert specified <delimiter> before a crc sum in the --embed-crc mode,  defau…'
complete -c has160-hash -l path-separator --description 'Use specified path separator to display paths.'
complete -c has160-hash -s q -l accept --description 'Set a comma-delimited list of extensions of the files to process.'
complete -c has160-hash -l exclude --description 'Set a comma-delimited list of extensions of the files to exclude from process…'
complete -c has160-hash -s t -l crc-accept --description 'Set a comma-delimited list of extensions of the hash files to verify.'
complete -c has160-hash -l maxdepth --description 'Descend at most <levels> (a non-negative integer) levels of directories below…'
complete -c has160-hash -s o -l output --description 'Set the file to output calculated hashes and verification results to.'
complete -c has160-hash -s l -l log --description 'Set the file to log errors and verbose information to.'
complete -c has160-hash -l openssl --description 'Specify which hash functions should be calculated using the OpenSSL library.'
complete -c has160-hash -l gost-reverse --description 'Reverse bytes in hexadecimal output of the GOST hash sum.'
complete -c has160-hash -l bt-batch --description 'Turn on torrent batch mode (implies torrent mode).'
complete -c has160-hash -l bt-private --description 'Generate BTIH for a private BitTorrent tracker.'
complete -c has160-hash -l bt-piece-length --description 'Set the  piece length value for torrent file.'
complete -c has160-hash -l bt-announce --description 'Add a tracker announce URL to the created torrent file(s).'
complete -c has160-hash -l benchmark-raw --description 'Switch benchmark output format to be a machine-readable tab-delimited text wi…'
complete -c has160-hash -l sfv --description 'Print hash sums in the SFV (Simple File Verification) output format (default).'
complete -c has160-hash -s m -l magnet --description 'Print hash sums formatted as magnet links.'
complete -c has160-hash -l bsd --description 'Use BSD output format.'
complete -c has160-hash -l simple --description 'Use simple output format.'
complete -c has160-hash -l uppercase --description 'Print hash sums in upper case.'
complete -c has160-hash -l lowercase --description 'Print hash sums in lower case.'
complete -c has160-hash -s p --description 'Format: print  format string the standard output, interpreting `\'  escapes an…'

