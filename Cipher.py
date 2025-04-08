import tkinter as tk
import random
import string

# Allowed characters for the encryption output
VALID_CHARACTERS = string.ascii_letters + string.digits + "!\"%&*()_-+={[}]:;@'~#>.<,?/|\\"

# --- Substitution functions ---
def substitution_encrypt(message, key):
    rng = random.Random(key + "substitution")
    permuted = list(VALID_CHARACTERS)
    rng.shuffle(permuted)
    mapping = dict(zip(VALID_CHARACTERS, permuted))
    return ''.join(mapping.get(c, c) for c in message)

def substitution_decrypt(message, key):
    rng = random.Random(key + "substitution")
    permuted = list(VALID_CHARACTERS)
    rng.shuffle(permuted)
    mapping = dict(zip(VALID_CHARACTERS, permuted))
    inv_mapping = {v: k for k, v in mapping.items()}
    return ''.join(inv_mapping.get(c, c) for c in message)

# --- Deterministic Column Transposition ---
def transpose_encrypt(message, key, num_cols):
    n = len(message)
    num_rows = -(-n // num_cols)  # ceiling division
    padded = message.ljust(num_rows * num_cols, 'X')
    grid = [list(padded[i*num_cols:(i+1)*num_cols]) for i in range(num_rows)]
    cols = list(range(num_cols))
    rng = random.Random(key + "transposition")
    rng.shuffle(cols)
    transposed = ''.join(''.join(row[j] for j in cols) for row in grid)
    return transposed

def transpose_decrypt(message, key, num_cols):
    n = len(message)
    num_rows = -(-n // num_cols)
    cols = list(range(num_cols))
    rng = random.Random(key + "transposition")
    rng.shuffle(cols)
    inverse = [0] * num_cols
    for i, col in enumerate(cols):
        inverse[col] = i
    rows = [list(message[i*num_cols:(i+1)*num_cols]) for i in range(num_rows)]
    original = ''
    for row in rows:
        original += ''.join(row[inverse[j]] for j in range(num_cols))
    return original.rstrip('X')

# --- XOR cipher ---
def xor_cipher(message, key):
    return ''.join(chr(ord(c) ^ ord(key[i % len(key)])) for i, c in enumerate(message))

# --- Deterministic grouping formatting ---
def format_groups(message):
    # Ensure no newline characters are present
    message = message.replace("\n", "")
    groups = []
    # Fixed cycle: groups of 3, 4, and 5 characters.
    pattern = [3, 4, 5]
    i, j = 0, 0
    while i < len(message):
        group_len = pattern[j % len(pattern)]
        groups.append(message[i:i+group_len])
        i += group_len
        j += 1
    # Join groups with exactly one space between them.
    return ' '.join(groups).strip()

# --- Overall Encryption/Decryption ---
def encrypt_message(message, key):
    # Remove any newline characters from the message
    message = message.replace("\n", "")
    # Use key to determine the number of columns (between 3 and 5)
    num_cols = (len(key) % 3) + 3
    sub = substitution_encrypt(message, key)
    trans = transpose_encrypt(sub, key, num_cols)
    xored = xor_cipher(trans, key)
    return format_groups(xored)

def decrypt_message(ciphertext, key):
    # Remove spaces (and any newlines) from the ciphertext
    text = ciphertext.replace(" ", "").replace("\n", "")
    xored = xor_cipher(text, key)
    num_cols = (len(key) % 3) + 3
    trans = transpose_decrypt(xored, key, num_cols)
    return substitution_decrypt(trans, key)

# --- Tkinter GUI ---
def encrypt():
    message = entry_message.get().replace("\n", "")
    key = entry_key.get()
    if not key:
        text_result.config(state="normal")
        text_result.delete(1.0, tk.END)
        text_result.insert(tk.END, "Key must not be empty!")
        return
    encrypted = encrypt_message(message, key)
    text_result.config(state="normal")
    text_result.delete(1.0, tk.END)
    text_result.insert(tk.END, encrypted)

def decrypt():
    message = entry_message.get().replace("\n", "")
    key = entry_key.get()
    if not key:
        text_result.config(state="normal")
        text_result.delete(1.0, tk.END)
        text_result.insert(tk.END, "Key must not be empty!")
        return
    decrypted = decrypt_message(message, key)
    text_result.config(state="normal")
    text_result.delete(1.0, tk.END)
    text_result.insert(tk.END, decrypted)

root = tk.Tk()
root.title("Advanced Cipher Tool")

tk.Label(root, text="Enter Message:").pack()
entry_message = tk.Entry(root, width=50)
entry_message.pack()

tk.Label(root, text="Enter Key (any length allowed):").pack()
entry_key = tk.Entry(root, width=50)
entry_key.pack()

tk.Button(root, text="Encrypt", command=encrypt).pack()
tk.Button(root, text="Decrypt", command=decrypt).pack()

text_result = tk.Text(root, height=5, width=50)
text_result.pack()

root.mainloop()
