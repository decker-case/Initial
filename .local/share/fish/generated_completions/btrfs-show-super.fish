# btrfs-show-super
# Autogenerated from man page /usr/share/man/man8/btrfs-show-super.8.gz
complete -c btrfs-show-super -s s --description 'has changed in version 4.'
complete -c btrfs-show-super -l bytenr --description 'instead.  The option.'
complete -c btrfs-show-super -s i --description 'has been deprecated.  Options.'
complete -c btrfs-show-super -s f -l full --description 'print full superblock information, including the system chunk array and backu…'
complete -c btrfs-show-super -s a -l all --description 'print information about all present superblock copies (cannot be used togethe…'
complete -c btrfs-show-super -l super --description '.'
complete -c btrfs-show-super -s F -l force --description 'attempt to print the superblock even if a valid BTRFS signature is not found;…'
complete -c btrfs-show-super -s e -l extents --description 'print only extent-related information: extent and device trees.'
complete -c btrfs-show-super -s d -l device --description 'print only device-related information: tree root, chunk and device trees.'
complete -c btrfs-show-super -s r -l roots --description 'print only short root node information, ie.  the root tree keys.'
complete -c btrfs-show-super -s R -l backups --description 'same as --roots plus print backup root info, ie.'
complete -c btrfs-show-super -s u -l uuid --description 'print only the uuid tree information, empty output if the tree does not exist.'
complete -c btrfs-show-super -s b --description 'print info of the specified block only.'
complete -c btrfs-show-super -s t --description 'print only the tree with the specified ID, where the ID can be numerical or c…'
complete -c btrfs-show-super -s v --description 'verbose mode, print count of returned paths and ioctl() return value logical-…'
complete -c btrfs-show-super -s P --description 'skip the path resolving and print the inodes instead.'
complete -c btrfs-show-super -l id --description 'specify the device id to query, default is 1 if this option is not used rooti…'

