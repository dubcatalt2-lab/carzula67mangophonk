
import os
import re
import sys

TOKEN = "__90638"
# Strings baked into the .wasm can't change length, so they get a token as long as 'scramjet'.
WASM_TOKEN = TOKEN + "0"

CONTENT_EXTENSIONS = {".js", ".mjs", ".cjs", ".html"}
SKIP_DIRS = {"node_modules", ".git", "types"}

# Case-insensitive; the lookbehind keeps npm package names (@mercuryworkshop/scramjet, ...)
# intact since node resolves them, not the browser.
# $scramjet$setrealmfn is hardcoded in the .wasm, so the JS side must use WASM_TOKEN to match.
PATTERN = re.compile(
    r"(?<!mercuryworkshop/)scramjet(\$setrealmfn)?", re.IGNORECASE
)


def replace_token(match):
    return WASM_TOKEN + match.group(1) if match.group(1) else TOKEN


def patch_wasm(path):
    with open(path, "rb") as f:
        data = f.read()
    patched = data.replace(b"scramjet", WASM_TOKEN.encode())
    if patched == data:
        return False
    with open(path, "wb") as f:
        f.write(patched)
    return True


def rename_path(path):
    directory, name = os.path.split(path)
    new_name = PATTERN.sub(replace_token, name)
    if new_name == name:
        return path
    new_path = os.path.join(directory, new_name)
    os.replace(path, new_path)
    return new_path


def rewrite_contents(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".wasm":
        return patch_wasm(path)
    if ext not in CONTENT_EXTENSIONS:
        return False
    try:
        # newline="" keeps CRLF/LF endings untouched
        with open(path, "r", encoding="utf-8", newline="") as f:
            content = f.read()
    except (UnicodeDecodeError, OSError):
        return False
    new_content = PATTERN.sub(replace_token, content)
    if new_content == content:
        return False
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(new_content)
    return True


def obfuscate(folders):
    renamed = rewritten = 0
    for folder in folders:
        if not os.path.isdir(folder):
            print(f"skipping missing folder: {folder}")
            continue
        for dirpath, dirnames, filenames in os.walk(folder):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for filename in filenames:
                path = os.path.join(dirpath, filename)
                if rewrite_contents(path):
                    rewritten += 1
                    print(f"-> rewrote: {path}")
                if rename_path(path) != path:
                    renamed += 1
                    print(f"-> renamed: {path}")
    print(f"\n{rewritten} files rewritten, {renamed} files renamed ('scramjet' -> '{TOKEN}')")


if __name__ == "__main__":
    obfuscate(sys.argv[1:] or ["public"])
