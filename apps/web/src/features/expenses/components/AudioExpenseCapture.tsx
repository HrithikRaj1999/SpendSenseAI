import { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, AlertTriangle, CheckCircle2, Mic, Square, Play, Pause, X } from "lucide-react";
import { useParseExpenseFromAudioMutation } from "../api/expensesApi";
import { ExpenseDetails } from "../types";

interface AudioExpenseCaptureProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: ExpenseDetails) => void;
}

export function AudioExpenseCapture({ isOpen, onClose, onConfirm }: AudioExpenseCaptureProps) {
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // API
    const [parseExpense, { isLoading, error }] = useParseExpenseFromAudioMutation();
    const [parsedData, setParsedData] = useState<ExpenseDetails | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [confidence, setConfidence] = useState<number>(0);

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Clean up URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    // Timer logic
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                setAudioUrl(URL.createObjectURL(audioBlob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setParsedData(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please allow permissions or try uploading a file.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAudioBlob(file);
            setAudioUrl(URL.createObjectURL(file));
            setParsedData(null);
            setWarnings([]);
        }
    };

    const handleParse = async () => {
        if (!audioBlob) return;

        try {
            const formData = new FormData();
            // Naming it 'recording.webm' or 'upload' doesn't strictly matter for blob, 
            // but backend checks mime type or filename extension.
            // If it's a file from upload, it has a name. If blob, we give it one.
            const filename = (audioBlob as File).name || "recording.webm";
            formData.append("file", audioBlob, filename);
            formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

            const result = await parseExpense(formData).unwrap();

            setParsedData(result.expense);
            setWarnings(result.warnings);
            setConfidence(result.confidence);
        } catch (err) {
            console.error("Failed to parse audio", err);
        }
    };

    const handleSave = () => {
        if (parsedData) {
            onConfirm(parsedData);
            onClose();
        }
    };

    const reset = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setParsedData(null);
        setRecordingTime(0);
        setWarnings([]);
        setIsRecording(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const updateField = (field: keyof ExpenseDetails, value: any) => {
        if (parsedData) {
            setParsedData({ ...parsedData, [field]: value });
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (audioPlayerRef.current) {
            if (isPlaying) {
                audioPlayerRef.current.pause();
            } else {
                audioPlayerRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Expense via Voice</DialogTitle>
                </DialogHeader>

                {!parsedData ? (
                    <div className="flex flex-col items-center gap-6 py-6 transition-all">
                        {/* Recording / Upload UI */}
                        {!audioBlob && !isRecording && (
                            <div className="flex gap-4 w-full justify-center">
                                <Button
                                    className="h-32 w-32 rounded-full flex flex-col gap-2 shadow-lg hover:scale-105 transition-transform"
                                    onClick={startRecording}
                                    variant="default"
                                >
                                    <Mic className="h-8 w-8" />
                                    <span>Record</span>
                                </Button>

                                <div
                                    className="h-32 w-32 rounded-full border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <UploadCloud className="h-6 w-6 mb-1 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Upload Audio</span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="audio/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}

                        {/* Active Recording State */}
                        {isRecording && (
                            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                                <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center animate-pulse">
                                    <Mic className="h-10 w-10 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="text-2xl font-mono font-bold">{formatTime(recordingTime)}</div>
                                <p className="text-sm text-muted-foreground">Listening...</p>
                                <Button variant="destructive" size="lg" className="rounded-full px-8" onClick={stopRecording}>
                                    <Square className="mr-2 h-4 w-4 fill-current" /> Stop
                                </Button>
                            </div>
                        )}

                        {/* Audio Preview & Parse Action */}
                        {audioBlob && !isRecording && (
                            <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                                <Card className="p-4 flex items-center gap-4 bg-muted/30 border-muted">
                                    <Button size="icon" variant="ghost" className="rounded-full h-10 w-10" onClick={togglePlay}>
                                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                    </Button>
                                    <div className="flex-1 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary animate-pulse w-full stats-bar" style={{ width: '100%' }}></div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive" onClick={reset}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <audio
                                        ref={audioPlayerRef}
                                        src={audioUrl || ""}
                                        onEnded={() => setIsPlaying(false)}
                                        onPause={() => setIsPlaying(false)}
                                        onPlay={() => setIsPlaying(true)}
                                        className="hidden"
                                    />
                                </Card>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>
                                            {(error as any)?.data?.detail || "Failed to process audio."}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Button onClick={handleParse} disabled={isLoading} className="w-full h-12 text-lg rounded-xl">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing with AI...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            Generate Expense
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        <div className="text-center text-sm text-muted-foreground max-w-xs">
                            Tip: Say something like "Paid 250 rupees for lunch at Haldiram via UPI today."
                        </div>
                    </div>
                ) : (
                    // Verify Step (Similar to AiImportModal but reused code would be better if refactored)
                    <div className="grid gap-4 py-4 animate-in fade-in slide-in-from-right-8">
                        {parsedData && (
                            <div className="flex flex-col gap-2">
                                {confidence < 0.6 && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Low Confidence ({Math.round(confidence * 100)}%)</AlertTitle>
                                        <AlertDescription>Please check the details below.</AlertDescription>
                                    </Alert>
                                )}
                                {warnings.map((w, i) => (
                                    <Alert key={i} className="py-2 border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription className="text-xs font-medium">{w}</AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Transcribed Text</Label>
                            <div className="text-sm text-muted-foreground italic p-2 bg-muted/50 rounded-lg">
                                "{(parsedData as any).rawText || "No raw text available"}"
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">Merchant / Title</Label>
                            <Input
                                id="title"
                                value={parsedData.title}
                                onChange={(e) => updateField("title", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount ({parsedData.currency || "INR"})</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={parsedData.amount}
                                    onChange={(e) => updateField("amount", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    value={parsedData.date || ""}
                                    onChange={(e) => updateField("date", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={parsedData.category}
                                    onChange={(e) => updateField("category", e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                <Input
                                    id="paymentMethod"
                                    value={parsedData.paymentMethod}
                                    onChange={(e) => updateField("paymentMethod", e.target.value as any)}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                                id="notes"
                                value={parsedData.notes || ""}
                                onChange={(e) => updateField("notes", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="sm:justify-between gap-2">
                    {parsedData ? (
                        <>
                            <Button variant="ghost" onClick={reset}>
                                Retry
                            </Button>
                            <Button onClick={handleSave} className="w-full sm:w-auto">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm & Save
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Simple Card wrapper since we don't have the component imported
function Card({ className, children }: { className?: string, children: React.ReactNode }) {
    return <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
}

function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />
        </svg>
    )
}
