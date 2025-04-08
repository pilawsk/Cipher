const VALID_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!\"%&*()_-+={[}]:;@'~#>.<,?/|\\";

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

function xorCipher(message, key) {
  return message.split("").map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join("");
}

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

function encryptMessage() {
  const message = document.getElementById("message").value;
  const key = document.getElementById("key").value;

  if (!key) {
    document.getElementById("result").value = "Key must not be empty!";
    return;
  }

  // Use the correct encryption function (e.g., 'encrypt' instead of calling encryptMessage recursively)
  const encrypted = encrypt(message, key);  // Call 'encrypt' instead of 'encryptMessage'
  document.getElementById("result").value = encrypted;
}

function decryptMessage(ciphertext, key) {
  let text = ciphertext.replace(/\s+/g, "");
  let xored = xorCipher(text, key);
  let numCols = (key.length % 3) + 3;
  let trans = transposeDecrypt(xored, key, numCols);
  return substitutionDecrypt(trans, key);
}

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

function encryptMessage() {
  const message = document.getElementById("message").value;
  const key = document.getElementById("key").value;
  if (!key) {
    document.getElementById("result").value = "Key must not be empty!";
    return;
  }
  const encrypted = encryptMessage(message, key);
  document.getElementById("result").value = encrypted;
}

function decryptMessage() {
  const message = document.getElementById("message").value;
  const key = document.getElementById("key").value;
  if (!key) {
    document.getElementById("result").value = "Key must not be empty!";
    return;
  }
  const decrypted = decryptMessage(message, key);
  document.getElementById("result").value = decrypted;
}
