const table = document.querySelector('#nodes-table tbody');
const form = document.querySelector('form');
const nodeNameInput = document.querySelector('#node-name');
const nodeAddressInput = document.querySelector('#node-address');
const etnyContractAddress = '0x549a6e06bb2084100148d50f51cf77a3436c3ae7';

// Load table data from local storage
const nodes = JSON.parse(localStorage.getItem('nodes')) || [];
nodes.forEach((node) => {
  addNodeToTable(node.nodeName, node.nodeAddress);
});

// Function to add a new row to the table
function addNodeToTable(nodeName, nodeAddress) {
  const newRow = table.insertRow();
  const nameCell = newRow.insertCell();
  const addressCell = newRow.insertCell();
  const timeCell = newRow.insertCell();
  const deleteCell = newRow.insertCell();
  const linkTextAddress = `${nodeAddress.slice(0, 7)}--${nodeAddress.slice(-7)}`;

  // Add node name
  nameCell.textContent = nodeName;

  // Add node address
  addressCell.innerHTML = `<a href="https://blockexplorer.bloxberg.org/address/${nodeAddress}" target="_blank" data-address="${nodeAddress}">${linkTextAddress}</a>`;

  // Add time since last transaction
  getTimeSinceLastTransaction(nodeAddress, function(time) {
    timeCell.textContent = time;
  });

  // Add delete button to row
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Del';
  deleteBtn.addEventListener('click', () => {
    table.deleteRow(newRow.rowIndex - 1);
    deleteNodeFromStorage(nodeAddress);
  });
  deleteCell.appendChild(deleteBtn);
}

// Function to delete a row from storage
function deleteNodeFromStorage(nodeAddress) {
  const nodes = JSON.parse(localStorage.getItem('nodes')) || [];
  const updatedNodes = nodes.filter((node) => node.nodeAddress !== nodeAddress);
  localStorage.setItem('nodes', JSON.stringify(updatedNodes));
}

// Function to add a node to storage
function addNodeToDatabase(nodeName, nodeAddress) {
  const nodes = JSON.parse(localStorage.getItem('nodes')) || [];
  const newNode = {
    nodeName: nodeName,
    nodeAddress: nodeAddress
  };
  nodes.push(newNode);
  localStorage.setItem('nodes', JSON.stringify(nodes));
}

// Function to calculate time since last transaction
function getTimeSinceLastTransaction(nodeAddress, callback) {
  $.getJSON(`https://blockexplorer.bloxberg.org/api?module=account&action=txlist&address=${nodeAddress}`, function(data) {
    const transactions = data.result;
    const latestTimestamp = transactions[0].timeStamp;
    const now = Math.floor(Date.now() / 1000);
    const secondsSinceLastTransaction = now - latestTimestamp;
    const hoursSinceLastTransaction = Math.floor(secondsSinceLastTransaction / 3600);
    const minutesSinceLastTransaction = Math.floor((secondsSinceLastTransaction % 3600) / 60);
    const timeSinceLastTransaction = hoursSinceLastTransaction + ' h ';
    callback(timeSinceLastTransaction);
  });
}

// Function update time since last transaction
function updateTimes() {
  const rows = table.rows;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const addressCell = row.cells[1];
    const timeCell = row.cells[2];
    const nodeAddress = addressCell.querySelector('a').getAttribute('data-address');
    getTimeSinceLastTransaction(nodeAddress, function(time) {
      timeCell.textContent = time;
    });
  }
}

// Event listener for form submit
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const nodeName = nodeNameInput.value.trim();
  const nodeAddress = nodeAddressInput.value.trim();

  // Check if nodeAddress is blank or not a valid address
  const validAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (nodeAddress === '' || !validAddressRegex.test(nodeAddress)) {
    alert('Please enter a valid Boxberg wallet address.');
    return;
  }

  addNodeToTable(nodeName, nodeAddress);
  addNodeToDatabase(nodeName, nodeAddress);

  nodeNameInput.value = '';
  nodeAddressInput.value = '';
});

// Call the updateTimes function every minute
setInterval(updateTimes, 60000);
