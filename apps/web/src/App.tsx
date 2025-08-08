import { RAGChat } from './components/RAGChat';
import { SystemStatus } from './components/SystemStatus';

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                ⚖️ Pocket Counsel
                            </h1>
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                RAG v1.0
                            </span>
                        </div>
                        <div className="text-sm text-gray-500">
                            AI-powered Zambian Legal Assistant
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* System Status Sidebar */}
                    <div className="lg:col-span-1">
                        <SystemStatus />
                    </div>

                    {/* RAG Chat Interface */}
                    <div className="lg:col-span-3">
                        <RAGChat />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="text-center text-sm text-gray-500">
                        <p>© 2025 Pocket Counsel. Powered by Google Cloud & Gemini AI.</p>
                        <p className="mt-1">
                            Built with React, TypeScript, tRPC, and Tailwind CSS
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App; 