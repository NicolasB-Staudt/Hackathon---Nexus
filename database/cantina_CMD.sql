create database Cantina_CMD;
use Cantina_CMD;

create table usuario_Adm(
idUsuarioAdm int not null auto_increment primary key,
email varchar(50) not null,
senha varchar(20) not null,
nome varchar(100) not null
);

create table usuario_Resp(
idResp int not null auto_increment primary key,
email varchar(50) not null,
senha varchar(20) not null,
nome varchar(100) not null 
);

create table usuario_Aluno(
idAluno int not null auto_increment primary key,
email varchar(50) not null,
senha varchar(20) not null,
nome varchar(100) not null, 
turma varchar(7) not null
);

create table aluno_respo(
idAluno int not null,
idResp int not null,
primary key (idAluno, idResp),
foreign key (idAluno) references usuario_Aluno(idAluno),
foreign key (idResp) references usuario_Resp(idResp)
);

create table conta_Aluno(
idConta int not null auto_increment primary key,
idAluno int not null unique,
saldo decimal(10,2) not null default 0,
limiteNegativo decimal(10,2) not null,
foreign key (idAluno) references usuario_Aluno(idAluno)
);

create table movimento_Conta(
idMovi int not null auto_increment primary key,
idConta int not null,
valor decimal(10,2) not null default 0,
dataHora datetime not null,
foreign key (idConta) references conta_Aluno(idConta)
);

create table produto(
idProd int not null auto_increment primary key,
nome varchar(40) not null,
descricao varchar(100),
preco decimal(10,2) not null,
disponivel char(1) not null 
);

create table estoque(
idItem int not null auto_increment primary key,
idProd int not null,
quantidade decimal(10,2) not null default 0,
foreign key (idProd) references produto(idProd)
);

create table cardapio(
idCard int not null auto_increment primary key,
dataCardapio datetime not null
);	

create table item_Cardapio(
idItemCard int not null auto_increment primary key,
idCard int not null,
idProd int not null,
disponivel char(1) not null,
foreign key (idCard) references cardapio(idCard),
foreign key (idProd) references produto(idProd)
);



