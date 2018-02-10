# git-checkout
# Autogenerated from man page /usr/share/man/man1/git-checkout.1.gz
complete -c git-checkout -s q -l quiet --description 'Quiet, suppress feedback messages.'
complete -c git-checkout -l progress --description 'Progress status is reported on the standard error stream by default when it i…'
complete -c git-checkout -s f -l force --description 'When switching branches, proceed even if the index or the working tree differ…'
complete -c git-checkout -l ours -l theirs --description 'When checking out paths from the index, check out stage #2 (ours) or #3 (thei…'
complete -c git-checkout -s b --description 'Create a new branch named <new_branch> and start it at <start_point>; see git…'
complete -c git-checkout -s B --description 'Creates the branch <new_branch> and start it at <start_point>; if it already …'
complete -c git-checkout -s t -l track --description 'When creating a new branch, set up "upstream" configuration.'
complete -c git-checkout -l no-track --description 'Do not set up "upstream" configuration, even if the branch.'
complete -c git-checkout -s l --description 'Create the new branch\\(cqs reflog; see git-branch(1) for details.'
complete -c git-checkout -l detach --description 'Rather than checking out a branch to work on it, check out a commit for inspe…'
complete -c git-checkout -l orphan --description 'Create a new orphan branch, named <new_branch>, started from <start_point> an…'
complete -c git-checkout -l ignore-skip-worktree-bits --description 'In sparse checkout mode, git checkout -- <paths> would update only entries ma…'
complete -c git-checkout -s m -l merge --description 'When switching branches, if you have local modifications to one or more files…'
complete -c git-checkout -l conflict --description 'The same as --merge option above, but changes the way the conflicting hunks a…'
complete -c git-checkout -s p -l patch --description 'Interactively select hunks in the difference between the <tree-ish> (or the i…'
complete -c git-checkout -l ignore-other-worktrees --description 'git checkout refuses when the wanted ref is already checked out by another wo…'
complete -c git-checkout -l recurse-submodules --description 'Using --recurse-submodules will update the content of all initialized submodu…'

