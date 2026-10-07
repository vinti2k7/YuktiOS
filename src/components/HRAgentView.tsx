import React, { useState } from 'react';
import { Employee, AttendanceRecord, PayrollRun } from '../types';
import { 
  Users, 
  Calendar, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Download, 
  Send, 
  FileText 
} from 'lucide-react';

interface HRAgentViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  payrollRuns: PayrollRun[];
  onRunPayroll: (month: string) => void;
}

export const HRAgentView: React.FC<HRAgentViewProps> = ({
  employees,
  attendance,
  payrollRuns,
  onRunPayroll,
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'payroll' | 'compliance'>('employees');
  const [isRunning, setIsRunning] = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');
  const [complianceFiled, setComplianceFiled] = useState(false);
  const [isFilingCompliance, setIsFilingCompliance] = useState(false);

  const totalBaseSalary = employees.reduce((acc, e) => acc + e.baseSalary, 0);
  const totalEpf = employees.reduce((acc, e) => acc + e.epfDeduction, 0);
  const totalEsi = employees.reduce((acc, e) => acc + e.esiDeduction, 0);
  const totalNet = employees.reduce((acc, e) => acc + e.netSalary, 0);

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch = 
      e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.role.toLowerCase().includes(empSearch.toLowerCase());
    const matchesDept = deptFilter === 'all' || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredAttendance = attendance.filter((a) => {
    const matchesSearch = a.empName.toLowerCase().includes(attendanceSearch.toLowerCase());
    const matchesStatus = attendanceStatusFilter === 'all' || a.status === attendanceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExecutePayroll = () => {
    setIsRunning(true);
    setTimeout(() => {
      onRunPayroll('August 2026');
      setIsRunning(false);
    }, 800);
  };

  const handleExportPayrollCSV = () => {
    const headers = ['Employee ID', 'Name', 'Role', 'Department', 'Gross Salary (INR)', 'EPF (12%)', 'ESI (0.75%)', 'Net Take-Home (INR)', 'Status'];
    const rows = employees.map((e) => [
      `"${e.id}"`,
      `"${e.name}"`,
      `"${e.role}"`,
      `"${e.department}"`,
      e.baseSalary,
      e.epfDeduction,
      e.esiDeduction,
      e.netSalary,
      `"${e.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `YuktiOS_Payroll_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileCompliance = () => {
    setIsFilingCompliance(true);
    setTimeout(() => {
      setIsFilingCompliance(false);
      setComplianceFiled(true);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-purple-400 bg-purple-950/40 border border-purple-800/50 px-2 py-0.5 rounded">
              HR & Payroll Agent
            </span>
            <span className="text-xs text-slate-400">EPF (12%) + ESI (0.75%) Statutory Compliance Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5">Workforce & Payroll Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Attendance verification, salary computation, and statutory compliance filings with zero manual entry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPayrollCSV}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            title="Download Employee Payroll Register as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleExecutePayroll}
            disabled={isRunning}
            id="btn-run-payroll-aug"
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunning ? 'Processing...' : 'Run August 2026 Payroll'}</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 block">Total Staff</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{employees.length} Active</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 block">Gross Monthly Base</span>
          <span className="text-lg font-bold text-white mt-0.5 block">₹{totalBaseSalary.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 block">Monthly EPF Pool</span>
          <span className="text-lg font-bold text-indigo-400 mt-0.5 block">₹{totalEpf.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-xs text-slate-400 block">Net Monthly Disbursal</span>
          <span className="text-lg font-bold text-emerald-400 mt-0.5 block">₹{totalNet.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-800 flex space-x-1 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'employees'
              ? 'border-purple-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Employee Roster ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-purple-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Biometric Attendance
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'payroll'
              ? 'border-purple-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Disbursal History ({payrollRuns.length})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-3.5 py-2 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'compliance'
              ? 'border-purple-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Statutory Compliance (EPF/ESI)
        </button>
      </div>

      {/* Employee Roster Tab */}
      {activeTab === 'employees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Employee Compensation Register</h3>
              <p className="text-xs text-slate-400">Standard statutory breakdown: EPF 12%, ESI 0.75%</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search employee or role..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-10 border border-slate-800 rounded-xl bg-slate-950/50">
              <Users className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-300">No employees match this filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3">Role / Dept</th>
                    <th className="py-2.5 px-3 text-right">Gross Base</th>
                    <th className="py-2.5 px-3 text-right">EPF (12%)</th>
                    <th className="py-2.5 px-3 text-right">ESI (0.75%)</th>
                    <th className="py-2.5 px-3 text-right">Net Take-Home</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-white">{emp.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {emp.role} <span className="text-[10px] text-slate-500">({emp.department})</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">₹{emp.baseSalary.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-indigo-400">₹{emp.epfDeduction.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-purple-400">₹{emp.esiDeduction.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                        ₹{emp.netSalary.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-medium">
                          {emp.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Biometric Punch Logs (31 July 2026)
              </h3>
              <p className="text-xs text-slate-400">Hardware biometric gateway feed</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search staff attendance..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              <select
                value={attendanceStatusFilter}
                onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          {filteredAttendance.length === 0 ? (
            <div className="text-center py-10 border border-slate-800 rounded-xl bg-slate-950/50">
              <Calendar className="w-7 h-7 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-300">No attendance records found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAttendance.map((att) => (
                <div key={att.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">{att.empName}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Check In: {att.checkIn} | Check Out: {att.checkOut}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium font-mono ${
                      att.status === 'present'
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                    }`}
                  >
                    {att.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payroll Runs Tab */}
      {activeTab === 'payroll' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Payroll Disbursal History</h3>
          <div className="space-y-3">
            {payrollRuns.map((run) => (
              <div key={run.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{run.month}</span>
                    <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-medium">
                      {run.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">Disbursed for {run.totalEmployees} employees on {run.runDate}</p>
                </div>

                <div className="text-right space-y-0.5 font-mono">
                  <p className="text-xs text-slate-400">Gross: ₹{run.totalGrossSalary.toLocaleString('en-IN')}</p>
                  <p className="text-sm font-semibold text-emerald-400">Net Pay: ₹{run.totalNetSalary.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Statutory Compliance Breakdown
              </h3>
              <p className="text-xs text-slate-400">Auto-formatted ECR file generation for EPFO & ESIC portals</p>
            </div>

            <button
              onClick={handleFileCompliance}
              disabled={isFilingCompliance || complianceFiled}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                complianceFiled
                  ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {complianceFiled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Returns Filed with EPFO/ESIC</span>
                </>
              ) : isFilingCompliance ? (
                <>
                  <FileText className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                  <span>Generating ECR Bundle...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>File Monthly EPF/ESI Returns</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-semibold text-indigo-300 text-sm">Employee Provident Fund (EPF)</h4>
              <p className="text-slate-400">Statutory 12% deduction applied to basic wages. Auto-formatted for EPFO ECR file upload.</p>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-mono">
                <span className="text-slate-400">Monthly EPF Pool:</span>
                <span className="text-indigo-400 font-semibold">₹{totalEpf.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-semibold text-purple-300 text-sm">Employee State Insurance (ESI)</h4>
              <p className="text-slate-400">Statutory 0.75% employee contribution + 3.25% employer contribution calculated for workers.</p>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-mono">
                <span className="text-slate-400">Monthly ESI Pool:</span>
                <span className="text-purple-400 font-semibold">₹{totalEsi.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
