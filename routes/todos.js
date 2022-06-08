const todoRoutes = (app, fs) => {
    // variables
    const dataPath = './data/todos.json';
  
    // READ
    app.get('/todos', (req, res) => {
      fs.readFile(dataPath, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }
  
        res.send(JSON.parse(data));
      });
    });
  };
  
  module.exports = todoRoutes;