const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors')
const path = require('path')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const db = new sqlite3.Database('./carbook.db')
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS carlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderNo TEXT,
    contractNo TEXT,
    model TEXT,
    vin TEXT,
    chassis TEXT,
    cfr TEXT,
    remark TEXT,
    createTime TEXT
  )`)
})

// 查询全部
app.get('/api/list', (req, res) => {
  db.all(`SELECT * FROM carlist ORDER BY id DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

// 新增
app.post('/api/add', (req, res) => {
  const { orderNo, contractNo, model, vin, chassis, cfr, remark } = req.body
  const createTime = new Date().toLocaleString()
  const sql = `INSERT INTO carlist(orderNo,contractNo,model,vin,chassis,cfr,remark,createTime) VALUES (?,?,?,?,?,?,?,?)`
  db.run(sql, [orderNo, contractNo, model, vin, chassis, cfr, remark, createTime], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ id: this.lastID })
  })
})

// 删除
app.delete('/api/del/:id', (req, res) => {
  const id = req.params.id
  db.run(`DELETE FROM carlist WHERE id=?`, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ ok: true })
  })
})

// 修改
app.put('/api/edit/:id', (req, res) => {
  const id = req.params.id
  const { orderNo, contractNo, model, vin, chassis, cfr, remark } = req.body
  const sql = `UPDATE carlist SET orderNo=?,contractNo=?,model=?,vin=?,chassis=?,cfr=?,remark=? WHERE id=?`
  db.run(sql, [orderNo, contractNo, model, vin, chassis, cfr, remark, id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ ok: true })
  })
})

// ✅ Render 必须用这个端口写法
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
