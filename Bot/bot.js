async function postPythonApi(endpoint, data = {}) {
    const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
}
postPythonApi("api/hello", {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
})
.then(data => {
    console.log(data.reply);
});
