const express = require('express')
const path = require('path');
const app = express()
const port = 3000

const options = {
    root: path.join(__dirname)
};


app.use(express.static(path.join(__dirname, 'public')))

app.get('/api/getPop', (req, res) => {
    res.sendFile("/data/pop.csv", options)
})
app.get('/api/getGdp', (req, res) => {
    res.sendFile("/data/gdp_pcap.csv", options)
})
app.get('/api/getLex', (req, res) => {
    res.sendFile("/data/lex.csv", options)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

