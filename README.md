# tree-sitter-rhai

Tree-sitter grammar for the [Rhai](https://rhai.rs) scripting language.

## Requirements

You need `git`, `nodejs` and a C compiler installed on your system. Most
distributions already ship with these packages.

### Debian / Ubuntu

```bash
sudo apt install -y git nodejs npm build-essential
```

### Fedora

```bash
sudo dnf install -y git nodejs npm gcc gcc-c++ make
```

### Arch

```bash
sudo pacman -S --needed git nodejs npm base-devel
```

## Installation

### Neovim

Neovim must use the `tree-sitter-cli` to install the grammar. You have two
options:

- Use [Mason](https://github.com/mason-org/mason.nvim) (recommended)
- Install it system-wide through your package manager

Also install the
[nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) plugin to
get the `TSInstall` and `TSUpdate` commands. Then add the following to your
Neovim configuration (after loading nvim-treesitter):

```lua
-- Register filetype. Can be set in `filetype.lua`
vim.filetype.add({
	extension = {
		rhai = "rhai",
	},
})

-- Register parser in nvim-treesitter
vim.api.nvim_create_autocmd("User", {
	pattern = "TSUpdate",
	callback = function()
		require("nvim-treesitter.parsers").rhai = {
			install_info = {
				url = "https://github.com/elkowar/tree-sitter-rhai",
			},
		}
	end,
})

-- Enable highlighting.
-- Can be set in `ftplugins/rhai.lua` by directly adding `vim.treesitter.start()`
vim.api.nvim_create_autocmd('FileType', {
  pattern = { 'rhai' },
  callback = function() vim.treesitter.start() end,
})
```
Finally, install the Rhai grammar with `:TSInstall rhai`.

## Manual

### Build & Install

```bash
git clone https://github.com/elkowar/tree-sitter-rhai.git
cd tree-sitter-rhai
npm install
npx tree-sitter generate  # creates the parser sources in `src/`
npx tree-sitter build  # compiles the grammar as a shared library (`.so` on Linux)
make install  # installs headers and library in `/usr/local` by default
```

`npx tree-sitter build --wasm` builds a WebAssembly artifact for Tree-sitter playground/web use.

### Test

```bash
npx tree-sitter test
```
