const employeeRoutes = require('./routes/employeeRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/employees', employeeRoutes);
app.use('/api/users', userRoutes); 