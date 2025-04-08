const VALID_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"%&*()_-+={[}]:;@'~#>.<,?/|\\";

// Substitution Cipher
function substitutionEncrypt(message, key) {
  let rng = seedRandom(key + "substitution");
  let permuted = VALID_CHARACTERS.split("");
  rng.shuffle(permuted);
  let mapping = {};
  VALID_CHARACTERS.split("").forEach((char, index) => {
    mapping[char] = permuted[index];
  });

  return message.split("").map(char => mapping[char] || char).join("");
}

function substitutionDecrypt(message, key) {
  let rng = seedRandom(key + "substitution");
  let permuted = VALID_CHARACTERS.split("");
  rng.shuffle(permuted);
  let mapping = {};
  VALID_CHARACTERS.split("").forEach((char, index) => {
    mapping[char] = permuted[index];
  });

  let invMapping = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));
  return message.split("").map(char => invMapping[char] || char).join("");
}

// Transposition Cipher
function transposeEncrypt(message, key, numCols) {
  const n = message.length;
  const numRows = Math.ceil(n / numCols);
  let padded = message.padEnd(numRows * numCols, 'X');
  let grid = [];

  for (let i = 0; i < numRows; i++) {
    grid.push(padded.slice(i * numCols, (i + 1) * numCols).split(""));
  }

  let cols = [...Array(numCols).keys()];
  let rng = seedRandom(key + "transposition");
  rng.shuffle(cols);

  let transposed = "";
  grid.forEach(row => {
    cols.forEach(col => {
      transposed += row[col];
    });
  });

  return transposed;
}

function transposeDecrypt(message, key, numCols) {
  const n = message.length;
  const numRows = Math.ceil(n / numCols);
  let cols = [...Array(numCols).keys()];
  let rng = seedRandom(key + "transposition");
  rng.shuffle(cols);

  let inverse = Array(numCols);
  for (let i = 0; i < numCols; i++) {
    inverse[cols[i]] = i;
  }

  let rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(message.slice(i * numCols, (i + 1) * numCols).split(""));
  }

  let original = "";
  rows.forEach(row => {
    inverse.forEach(col => {
      original += row[col];
    });
  });

  return original.replace(/X+$/, "");
}

// XOR Cipher
function xorCipher(message, key) {
  return message.split("").map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join("");
}

// Format groups (3 to 5 characters)
function formatGroups(message) {
  let groups = [];
  const pattern = [3, 4, 5];
  let i = 0, j = 0;
  while (i < message.length) {
    let groupLen = pattern[j % pattern.length];
    groups.push(message.slice(i, i + groupLen));
    i += groupLen;
    j++;
  }
  return groups.join(" ");
}

// Encryption handler
function encryptMessage() {
  const message = document.getElementById("message").value;
  const key = document.getElementById("key").value;

  if (!key) {
    document.getElementById("result").value = "Key must not be empty!";
    return;
  }

  const numCols = (key.length % 3) + 3;
  let encrypted = xorCipher(message, key);
  encrypted = transposeEncrypt(encrypted, key, numCols);
  encrypted = substitutionEncrypt(encrypted, key);

  // Format the encrypted message with groups of characters
  document.getElementById("result").value = formatGroups(encrypted);
}

// Decryption handler
function decryptMessage() {
  const message = document.getElementById("message").value;
  const key = document.getElementById("key").value;

  if (!key) {
    document.getElementById("result").value = "Key must not be empty!";
    return;
  }

  const numCols = (key.length % 3) + 3;
  let decrypted = substitutionDecrypt(message, key);
  decrypted = transposeDecrypt(decrypted, key, numCols);
  decrypted = xorCipher(decrypted, key);

  document.getElementById("result").value = decrypted;
}

// Random seed generator (includes seedrandom library)
function seedRandom(seed) {
  const rng = new Math.seedrandom(seed);
  return {
    shuffle: function(array) {
      let currentIndex = array.length, randomIndex, temporaryValue;
      while (currentIndex !== 0) {
        randomIndex = Math.floor(rng() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
    }
  };
}
