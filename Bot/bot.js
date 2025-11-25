fetch("http://127.0.0.1:5000/api/hello", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "John" })
})
.then(res => res.json())
.then(data => {
    console.log(data.message);
});
