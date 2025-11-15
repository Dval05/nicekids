import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { authMiddleware, adminOnly } from '../../middleware/auth.js';
const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(authMiddleware);
router.use(adminOnly);

// GET /api/reports?type=...&startDate=...&endDate=...
router.get('/', async (req, res) => {
    const { supabase } = req;
    const { type, startDate, endDate } = req.query;

    if (!type || !startDate || !endDate) {
        return res.status(400).json({ message: 'Parameters type, startDate, and endDate are required.' });
    }

    try {
        let query;
        let dateColumn;
        
        switch (type) {
            case 'student_attendance':
                dateColumn = 'Date';
                query = supabase.from('attendance').select(`*, student:StudentID (FirstName, LastName)`);
                break;
            case 'employee_attendance':
                dateColumn = 'Date';
                query = supabase.from('employee_attendance').select(`*, employee:EmpID (FirstName, LastName)`);
                break;
            case 'student_performance':
                dateColumn = 'ObservationDate';
                query = supabase.from('student_observation').select(`*, student:StudentID (FirstName, LastName), employee:EmpID (FirstName, LastName)`);
                break;
            case 'student_payments':
                dateColumn = 'DueDate';
                query = supabase.from('student_payment').select(`*, student:StudentID (FirstName, LastName)`);
                break;
            case 'teacher_payments':
                dateColumn = 'PaymentDate';
                query = supabase.from('teacher_payment').select(`*, employee:EmpID (FirstName, LastName)`);
                break;
            default:
                return res.status(400).json({ message: 'Invalid report type specified.' });
        }

        const { data, error } = await query
            .gte(dateColumn, startDate)
            .lte(dateColumn, endDate)
            .order(dateColumn, { ascending: true });
        
        if (error) throw error;
        
        res.json(data);

    } catch (error) {
        console.error(`Error generating report for type "${type}":`, error);
        res.status(500).json({ message: error.message });
    }
});

// POST /api/reports/analyze
router.post('/analyze', async (req, res) => {
    const { supabase } = req;
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Parameters startDate and endDate are required.' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ message: 'API key for Gemini is not configured on the server.' });
    }

    try {
        // 1. Fetch financial data
        const { data: incomeData, error: incomeError } = await supabase
            .from('student_payment')
            .select('TotalAmount, Status')
            .gte('PaymentDate', startDate)
            .lte('PaymentDate', endDate)
            .eq('Status', 'Paid');

        const { data: expenseData, error: expenseError } = await supabase
            .from('teacher_payment')
            .select('TotalAmount, Status')
            .gte('PaymentDate', startDate)
            .lte('PaymentDate', endDate)
            .eq('Status', 'Paid');

        if (incomeError || expenseError) {
            throw new Error('Failed to fetch financial data from the database.');
        }

        const totalIncome = incomeData.reduce((acc, p) => acc + p.TotalAmount, 0);
        const totalExpenses = expenseData.reduce((acc, p) => acc + p.TotalAmount, 0);

        // 2. Prepare prompt for Gemini
        const financialContext = `
            Financial Data for period ${startDate} to ${endDate}:
            - Total Income (from student payments): $${totalIncome.toFixed(2)} from ${incomeData.length} transactions.
            - Total Expenses (from teacher payroll): $${totalExpenses.toFixed(2)} from ${expenseData.length} transactions.
        `;

        const prompt = `
            Actúa como un analista financiero experto para un centro de educación infantil en Ecuador. 
            Basándote en los siguientes datos financieros, proporciona un análisis detallado y profesional en español.
            Tu análisis debe estar bien estructurado y contener las siguientes secciones con títulos claros:

            1.  **Resumen Ejecutivo:** Ofrece un resumen conciso de la situación financiera en el período, mencionando ingresos, egresos y el resultado neto (beneficio o pérdida).
            2.  **Análisis de Ingresos:** Comenta sobre el total de ingresos. Si el número de transacciones es alto, sugiere que el flujo de caja es constante.
            3.  **Análisis de Egresos:** Comenta sobre los gastos, que corresponden principalmente a la nómina.
            4.  **Salud Financiera y Recomendaciones:** Evalúa la salud financiera general del centro durante este período. Ofrece 2 o 3 recomendaciones prácticas y específicas para la gestión de un centro educativo. Por ejemplo, podrías sugerir optimizar recursos, explorar nuevas líneas de ingreso (cursos de verano, actividades extracurriculares), o estrategias para la gestión de la morosidad si los datos lo sugirieran (aunque aquí no se proveen datos de morosidad).
            5.  **Conclusión:** Finaliza con una conclusión clara sobre el desempeño financiero del período.

            Usa un tono profesional, claro y directo. Formatea tu respuesta con saltos de línea para facilitar la lectura.

            ---
            ${financialContext}
            ---
        `;

        // 3. Call Gemini API
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        const analysisText = response.text;
        
        res.json({ analysis: analysisText });

    } catch (error) {
        console.error('Error generating AI analysis:', error);
        res.status(500).json({ message: error.message || 'An unexpected error occurred while generating the AI analysis.' });
    }
});

export default router;