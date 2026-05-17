import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Code2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default function Home() {
    const [problemId, setProblemId] = useState("");
    const [, setLocation] = useLocation();

    const handleSearch = () => {
        if (problemId.trim()) {
            setLocation(`/solve/${problemId.trim()}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="relative min-h-screen bg-white text-gray-800 font-sans flex flex-col items-center justify-center -mt-20">
            <Button
                className="absolute right-4 top-24 h-10 rounded-full bg-[#0076C0] px-4 text-white shadow-sm hover:bg-[#0066a6] sm:right-6 sm:top-6"
                onClick={() => setLocation("/ide")}
            >
                <Code2 className="h-4 w-4" />
                IDE
            </Button>

            <div className="w-full max-w-2xl px-4 flex flex-col items-center gap-8">
                <Link href="/" className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                    <div className="text-6xl font-bold text-[#0076C0] tracking-tighter">
                        psgrammers
                    </div>
                    <p className="text-gray-400 font-medium tracking-wide">
                        Online Judge
                    </p>
                </Link>

                <div className="w-full relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#0076C0] transition-colors" />
                    </div>
                    <Input
                        type="text"
                        placeholder="이곳에 문제 번호를 입력하세요 (예: 1000)"
                        className="w-full h-14 pl-12 pr-4 text-lg bg-white border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md focus:shadow-lg focus:border-[#0076C0] focus:ring-0 transition-all duration-300 placeholder:text-gray-300"
                        value={problemId}
                        onChange={(e) => setProblemId(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center">
                        <Button
                            className="h-10 w-10 p-0 rounded-full bg-transparent hover:bg-blue-50 text-[#0076C0]"
                            onClick={handleSearch}
                            aria-label="Search Problem"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="h-11 rounded-full border-2 border-gray-200 bg-white px-5 text-gray-600 hover:border-[#0076C0] hover:bg-blue-50 hover:text-[#0076C0]"
                    onClick={() => setLocation("/ide")}
                >
                    <Code2 className="mr-2 h-4 w-4" />
                    문제 없이 IDE 열기
                </Button>

                <div className="flex gap-6 text-sm text-gray-400 mt-8">
                    <span className="hover:text-[#0076C0] cursor-pointer transition-colors">문제 검색 방법</span>
                    <span className="hover:text-[#0076C0] cursor-pointer transition-colors">랜덤 풀기</span>
                </div>
            </div>
        </div>
    );
}
