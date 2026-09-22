import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Wallet, LayoutDashboard, Receipt, Plus, LogOut, ArrowUpRight, ArrowDownRight, Pencil, Trash2, Menu, X, UserRound } from 'lucide-react';
import { api } from './api';
import './styles.css';

const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Education', 'Salary', 'Other'];
const paymentMethods = ['CASH', 'UPI', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER'];

function money(v) { return `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function dateLabel(v) { return new Date(`${v}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('auth_user') || 'null'));
  const [page, setPage] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadTransactions = async () => {
    if (!user) return;
    setLoading(true); setError('');
    try { const data = await api.transactions(); setTransactions(data.content || []); }
    catch (e) { if (e.message.toLowerCase().includes('401')) logout(); else setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadTransactions(); }, [user]);

  function login(data) { localStorage.setItem('token', data.token); localStorage.setItem('auth_user', JSON.stringify(data.user)); setUser(data.user); setPage('dashboard'); }
  function logout() { localStorage.clear(); setUser(null); setTransactions([]); }

  if (!user) return <Auth mode={authMode} setMode={setAuthMode} onLogin={login} />;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-icon"><Wallet size={21}/></div><span>Expense<span className="brand-accent">Tracker</span></span><button className="close-mobile" onClick={() => setMobileOpen(false)}><X/></button></div>
      <nav>
        <NavItem icon={<LayoutDashboard/>} text="Dashboard" active={page === 'dashboard'} onClick={() => {setPage('dashboard');setMobileOpen(false)}}/>
        <NavItem icon={<Receipt/>} text="Transactions" active={page === 'transactions'} onClick={() => {setPage('transactions');setMobileOpen(false)}}/>
        <NavItem icon={<Plus/>} text="Add Transaction" active={page === 'add'} onClick={() => {setEditing(null);setPage('add');setMobileOpen(false)}}/>
      </nav>
      <div className="sidebar-bottom"><div className="mini-profile"><div className="avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div><div><b>{user.name}</b><span>{user.email}</span></div></div><button className="logout" onClick={logout}><LogOut size={17}/> Logout</button></div>
    </aside>
    {mobileOpen && <div className="overlay" onClick={() => setMobileOpen(false)}/>}
    <main className="main"><header className="topbar"><button className="menu" onClick={() => setMobileOpen(true)}><Menu/></button><div><h2>{page === 'dashboard' ? 'Dashboard' : page === 'transactions' ? 'Transactions' : editing ? 'Edit Transaction' : 'Add Transaction'}</h2><p>Manage your money with a clear view of your finances.</p></div><div className="top-user"><UserRound size={18}/><span>{user.name}</span></div></header>
      <div className="content">{error && <div className="error-banner">{error}</div>}{page === 'dashboard' && <Dashboard transactions={transactions} loading={loading} user={user}/>} {page === 'transactions' && <Transactions transactions={transactions} loading={loading} onAdd={()=>{setEditing(null);setPage('add')}} onEdit={(t)=>{setEditing(t);setPage('add')}} onDelete={async(id)=>{if(confirm('Delete this transaction?')){await api.deleteTransaction(id);loadTransactions()}}}/>} {page === 'add' && <TransactionForm initial={editing} onSaved={()=>{setPage('transactions');loadTransactions()}}/>}</div>
    </main>
  </div>;
}

function NavItem({icon,text,active,onClick}) { return <button className={`nav-item ${active?'active':''}`} onClick={onClick}>{icon}<span>{text}</span></button>; }

function Auth({mode,setMode,onLogin}) {
  const [form,setForm]=useState({name:'',email:'',password:'',confirmPassword:''}); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  async function submit(e){e.preventDefault();setError('');setBusy(true);try{if(mode==='login'){onLogin(await api.login({email:form.email,password:form.password}));}else{await api.register(form);setMode('login');setError('');alert('Registration successful. Please login.');}}catch(err){setError(err.message)}finally{setBusy(false)}}
  return <div className="auth-page"><div className="auth-card"><div className="auth-logo"><Wallet/></div><h1>{mode==='login'?'Welcome back':'Create your account'}</h1><p>{mode==='login'?'Track your spending and stay in control.':'Start managing your personal finances today.'}</p>{error&&<div className="error-banner">{error}</div>}<form onSubmit={submit}>{mode==='register'&&<Field label="Full name" value={form.name} onChange={v=>setForm({...form,name:v})} required/>}<Field label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} required/><Field label="Password" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} required/>{mode==='register'&&<Field label="Confirm password" type="password" value={form.confirmPassword} onChange={v=>setForm({...form,confirmPassword:v})} required/>}<button className="primary full" disabled={busy}>{busy?'Please wait...':mode==='login'?'Sign In':'Create Account'}</button></form><div className="switch-auth">{mode==='login'?"Don't have an account?":"Already have an account?"}<button onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'Create one':'Sign in'}</button></div></div></div>;
}
function Field({label,type='text',value,onChange,required}) { return <label className="field"><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} required={required}/></label>; }

function Dashboard({transactions,loading,user}) {
  const stats=useMemo(()=>{let income=0,expense=0;const cats={};transactions.forEach(t=>{const a=Number(t.amount);if(t.type==='INCOME')income+=a;else{expense+=a;cats[t.category]=(cats[t.category]||0)+a}});return {income,expense,balance:income-expense,cats};},[transactions]);
  const pie=Object.entries(stats.cats).map(([name,value])=>({name,value})); const monthly={};transactions.forEach(t=>{const m=new Date(`${t.date}T00:00:00`).toLocaleDateString('en-US',{month:'short'});monthly[m]??={name:m,income:0,expense:0};monthly[m][t.type==='INCOME'?'income':'expense']+=Number(t.amount)});const bars=Object.values(monthly).slice(-6);
  return <><section className="welcome"><div><p className="eyebrow">FINANCIAL OVERVIEW</p><h1>Hi, {user.name} 👋</h1><p>Here’s how your finances are looking based on your recorded transactions.</p></div><button className="primary" onClick={()=>location.reload()}>Refresh</button></section><div className="stat-grid"><Stat title="Total Balance" value={money(stats.balance)} icon={<Wallet/>} tone="blue"/><Stat title="Total Income" value={money(stats.income)} icon={<ArrowUpRight/>} tone="green"/><Stat title="Total Expenses" value={money(stats.expense)} icon={<ArrowDownRight/>} tone="red"/></div><div className="chart-grid"><Panel title="Income vs Expense"><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={bars}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis/><Tooltip formatter={v=>money(v)}/><Bar dataKey="income" fill="#1d9b6c" radius={[5,5,0,0]}/><Bar dataKey="expense" fill="#e25b5b" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></Panel><Panel title="Expense by Category"><div className="chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>{pie.map((_,i)=><Cell key={i} fill={['#4f67e8','#1d9b6c','#e25b5b','#e0a126','#8b5cf6','#0ea5e9'][i%6]}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer></div></Panel></div><Panel title="Recent Transactions"><TransactionTable transactions={transactions.slice(0,6)} empty="No transactions yet."/></Panel>{loading&&<p className="muted">Loading transactions...</p>}</>;
}
function Stat({title,value,icon,tone}) { return <div className="stat-card"><div><span>{title}</span><strong>{value}</strong></div><div className={`stat-icon ${tone}`}>{icon}</div></div>; }
function Panel({title,children}) { return <section className="panel"><div className="panel-head"><h3>{title}</h3></div>{children}</section>; }

function Transactions({transactions,loading,onAdd,onEdit,onDelete}) { const [search,setSearch]=useState('');const filtered=transactions.filter(t=>`${t.category} ${t.description} ${t.paymentMethod}`.toLowerCase().includes(search.toLowerCase())); return <><section className="page-intro"><div><p className="eyebrow">MONEY MOVEMENT</p><h1>Transactions</h1><p>Review and manage your income and expenses.</p></div><button className="primary" onClick={onAdd}>+ Add Transaction</button></section><div className="toolbar"><input placeholder="Search transactions..." value={search} onChange={e=>setSearch(e.target.value)}/></div><Panel title={`${filtered.length} transaction${filtered.length===1?'':'s'}`}><TransactionTable transactions={filtered} onEdit={onEdit} onDelete={onDelete} empty={loading?'Loading...':'No matching transactions.'}/></Panel></>; }
function TransactionTable({transactions,onEdit,onDelete,empty}) { if(!transactions.length)return <div className="empty">{empty}</div>;return <div className="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Payment</th><th>Type</th><th>Amount</th><th></th></tr></thead><tbody>{transactions.map(t=><tr key={t.id}><td>{dateLabel(t.date)}</td><td><b>{t.description}</b></td><td><span className="tag">{t.category}</span></td><td>{t.paymentMethod.replaceAll('_',' ')}</td><td><span className={`type ${t.type.toLowerCase()}`}>{t.type}</span></td><td className={`amount ${t.type==='INCOME'?'income':'expense'}`}>{t.type==='INCOME'?'+':'-'}{money(t.amount)}</td><td className="actions">{onEdit&&<button onClick={()=>onEdit(t)} title="Edit"><Pencil size={16}/></button>}{onDelete&&<button onClick={()=>onDelete(t.id)} title="Delete"><Trash2 size={16}/></button>}</td></tr>)}</tbody></table></div>; }

function TransactionForm({initial,onSaved}) { const [form,setForm]=useState(initial?{...initial}: {amount:'',type:'EXPENSE',category:'Food',description:'',date:new Date().toISOString().slice(0,10),paymentMethod:'UPI'});const [busy,setBusy]=useState(false);const [error,setError]=useState('');async function submit(e){e.preventDefault();setBusy(true);setError('');try{const body={...form,amount:Number(form.amount)};if(initial)await api.updateTransaction(initial.id,body);else await api.createTransaction(body);onSaved()}catch(err){setError(err.message)}finally{setBusy(false)}}return <Panel title={initial?'Edit Transaction':'Add Transaction'}><form className="transaction-form" onSubmit={submit}>{error&&<div className="error-banner">{error}</div>}<Field label="Amount" type="number" value={form.amount} onChange={v=>setForm({...form,amount:v})} required/><label className="field"><span>Type</span><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></label><label className="field"><span>Category</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><Field label="Description" value={form.description} onChange={v=>setForm({...form,description:v})} required/><label className="field"><span>Date</span><input type="date" value={form.date} max={new Date().toISOString().slice(0,10)} onChange={e=>setForm({...form,date:e.target.value})} required/></label><label className="field"><span>Payment Method</span><select value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})}>{paymentMethods.map(p=><option key={p}>{p.replaceAll('_',' ')}</option>)}</select></label><div className="form-actions"><button type="submit" className="primary" disabled={busy}>{busy?'Saving...':initial?'Update Transaction':'Save Transaction'}</button></div></form></Panel>; }


createRoot(document.getElementById('root')).render(<App/>);
