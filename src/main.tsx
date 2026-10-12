import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'katex/dist/katex.min.css';
import { installAiFetchGuard } from './services/aiGate.ts';

installAiFetchGuard();

createRoot(document.getElementById('root')!).render(<App />);
