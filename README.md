# VSCode Rails Navigation

VSCode extension for Rails file navigation.
It is heavily inspired by [tpope/vim-rails](https://github.com/tpope/vim-rails).

*For now, it supports only some features from vim-rails.*

# Usage

Three commands:

- `Rails Nav: Open Alternate file`
- `Rails Nav: Open Related file`
- `Rails Nav: Go to cursored file`

## Open Alternate/Related file

| Current file | Alternate file | Related file |
| - | - | - |
| model | unit test | - |
| controller (in method) | functional test | template (view) |
| template (view) | functional test | controller (jump to method) |

Supported test framework is RSpec only for now.

## Go to cursored file

Example uses of "Go to cursored file".

(* indicates cursor position)

```
    <%= render 'sh*ared/sidebar' %>
    app/views/shared/_sidebar.html.erb
```

# Integration with VSCodeVim

If you want to integrate with VSCodeVim, put `settings.json` like below.

```
    "vim.leader": ",", # leave it for you
    "vim.normalModeKeyBindingsNonRecursive": [
        {
            "before": [ "<leader>", "A" ],
            "commands": [ "rails-navigation.openAlternateFile" ]
        },
        {
            "before": [ "<leader>", "R" ],
            "commands": [ "rails-navigation.openRelatedFile" ]
        }
        {
            "before": [ "<leader>", "g", "f" ],
            "commands": [ "rails-navigation.goToFile" ]
        }
    ]
```
