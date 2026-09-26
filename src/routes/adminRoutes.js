const r=require('express').Router();
const c=require('../controllers/adminController');
const {somenteAdm}=require('../middlewares/authMiddleware');
r.post('/solicitar',c.solicitar);
r.use(somenteAdm);
r.get('/solicitacoes',c.listar);
r.patch('/:id/aprovar',c.aprovar);
r.patch('/:id/rejeitar',c.rejeitar);
module.exports=r;
