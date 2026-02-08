import { useState, useRef } from "react";
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
import { Loader2, UploadCloud, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useParseExpenseFromImageMutation } from "../api/expensesApi";
import { ExpenseDetails } from "../types";

interface AiImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: ExpenseDetails) => void;
}

export function AiImportModal({ isOpen, onClose, onConfirm }: AiImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [parseExpense, { isLoading, error }] = useParseExpenseFromImageMutation();

    // Staging state for verification
    const [parsedData, setParsedData] = useState<ExpenseDetails | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);
    const [confidence, setConfidence] = useState<number>(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setParsedData(null); // Reset if new file
            setWarnings([]);
        }
    };

    const handleParse = async () => {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("file", file);
            // Optional: append timezone or nowIso if needed
            formData.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

            const result = await parseExpense(formData).unwrap();

            setParsedData(result.expense);
            setWarnings(result.warnings);
            setConfidence(result.confidence);
        } catch (err) {
            console.error("Failed to parse image", err);
        }
    };

    const handleSave = () => {
        if (parsedData) {
            onConfirm(parsedData);
            onClose();
        }
    };

    // Helper to update parsedData fields
    const updateField = (field: keyof ExpenseDetails, value: any) => {
        if (parsedData) {
            setParsedData({ ...parsedData, [field]: value });
        }
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setParsedData(null);
        setWarnings([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import Expense from Receipt</DialogTitle>
                </DialogHeader>

                {!parsedData ? (
                    // Upload Step
                    <div className="flex flex-col items-center gap-6 py-6">
                        <div
                            className={`
                flex flex-col items-center justify-center w-full h-48 
                rounded-xl border-2 border-dashed 
                ${preview ? "border-emerald-500/50 bg-emerald-50/10" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
                transition-colors cursor-pointer
              `}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {preview ? (
                                <img src={preview} alt="Receipt preview" className="h-full object-contain rounded-md" />
                            ) : (
                                <div className="flex flex-col items-center text-muted-foreground">
                                    <UploadCloud className="h-10 w-10 mb-2" />
                                    <p className="text-sm font-medium">Click to upload receipt image</p>
                                    <p className="text-xs text-muted-foreground/75 mt-1">PNG, JPG, WebP supported</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    {(error as any)?.data?.detail || "Failed to parse image. Please try again."}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button onClick={handleParse} disabled={!file || isLoading} className="w-full sm:w-auto min-w-[150px]">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Parsing with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Parse Receipt
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    // Verify Step
                    <div className="grid gap-4 py-4">
                        {/* Warnings / Confidence */}
                        {parsedData && (
                            <div className="flex flex-col gap-2">
                                {confidence < 0.6 && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Low Confidence ({Math.round(confidence * 100)}%)</AlertTitle>
                                        <AlertDescription>Please verify the details below carefully.</AlertDescription>
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
                            <Label htmlFor="title">Merchant / Title</Label>
                            <Input
                                id="title"
                                value={parsedData.title}
                                onChange={(e) => updateField("title", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount</Label>
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
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                value={parsedData.description || ""}
                                onChange={(e) => updateField("description", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="sm:justify-between gap-2">
                    {parsedData ? (
                        <>
                            <Button variant="ghost" onClick={reset}>
                                Upload Different Image
                            </Button>
                            <Button onClick={handleSave}>
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
