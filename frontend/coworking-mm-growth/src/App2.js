<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App2</title>
</head>
<body>
    <h1>App2: Frontend</h1>
    <form id="dataForm">
        <label for="inputData">Enter Data:</label>
        <input type="text" id="inputData" name="inputData" required>
        <button type="submit">Send Data</button>
    </form>
    <p id="responseMessage"></p>

    <script>
        document.getElementById('dataForm').addEventListener('submit', function(event) {
            event.preventDefault();

            const inputData = document.getElementById('inputData').value;

            fetch('http://localhost:5000/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: inputData })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('responseMessage').innerText = data.message;
            })
            .catch(error => console.error('Error:', error));
        });
    </script>
</body>
</html>
