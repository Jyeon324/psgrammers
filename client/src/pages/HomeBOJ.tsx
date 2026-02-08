import { Link } from "wouter";
import { Search, Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HomeBOJ() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Top Navigation Bar - BOJ Style (Blue/White) */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="text-2xl font-bold text-[#0076C0] tracking-tighter">
                            Online Judge
                        </Link>
                        <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
                            <a href="#" className="hover:text-[#0076C0]">문제</a>
                            <a href="#" className="hover:text-[#0076C0]">문제집</a>
                            <a href="#" className="hover:text-[#0076C0]">대회</a>
                            <a href="#" className="hover:text-[#0076C0]">채점 현황</a>
                            <a href="#" className="hover:text-[#0076C0]">랭킹</a>
                            <a href="#" className="hover:text-[#0076C0]">게시판</a>
                            <a href="#" className="hover:text-[#0076C0]">그룹</a>
                            <a href="#" className="hover:text-[#0076C0]">블로그</a>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative hidden md:block">
                            <Input
                                type="text"
                                placeholder="문제 검색"
                                className="w-64 h-8 text-sm bg-gray-100 border-none focus:ring-1 focus:ring-[#0076C0]"
                            />
                            <Search className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <Link href="/login" className="text-gray-500 hover:text-[#0076C0]">로그인</Link>
                            <span className="text-gray-300">|</span>
                            <Link href="/register" className="text-gray-500 hover:text-[#0076C0]">가입</Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content Area (Left/Center) */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* News/Banner Section */}
                        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">새로운 소식</h2>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-gray-700">Code Manager 서비스 런칭 안내</span>
                                    <span className="text-gray-400 text-xs">2025-05-20</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-700">[점검] 서버 점검 예정 (02:00 ~ 04:00)</span>
                                    <span className="text-gray-400 text-xs">2025-05-18</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-700">새로운 알고리즘 문제가 추가되었습니다.</span>
                                    <span className="text-gray-400 text-xs">2025-05-15</span>
                                </li>
                            </ul>
                        </div>

                        {/* Problem List Preview */}
                        <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="text-lg font-bold text-gray-800">추가된 문제</h2>
                                <a href="#" className="text-xs text-[#0076C0] hover:underline">더보기</a>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium">
                                        <tr>
                                            <th className="px-4 py-2 w-16">#</th>
                                            <th className="px-4 py-2">제목</th>
                                            <th className="px-4 py-2 w-24">정보</th>
                                            <th className="px-4 py-2 w-24">제출</th>
                                            <th className="px-4 py-2 w-24">정답 비율</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[1000, 1001, 1002, 1003, 1004].map((id) => (
                                            <tr key={id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-2 text-gray-500">{id}</td>
                                                <td className="px-4 py-2 font-medium text-gray-800">
                                                    <a href="#" className="hover:underline hover:text-[#0076C0]">A+B</a>
                                                </td>
                                                <td className="px-4 py-2 text-gray-500">
                                                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">수학</span>
                                                </td>
                                                <td className="px-4 py-2 text-gray-500">12,402</td>
                                                <td className="px-4 py-2 text-gray-500">42%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="space-y-6">
                        <div className="bg-[#0076C0] text-white p-6 rounded-sm shadow-sm">
                            <h3 className="font-bold text-lg mb-2">Code Manager</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                나만의 알고리즘 학습 공간.<br />
                                지금 바로 시작하세요.
                            </p>
                            <Button variant="secondary" className="w-full bg-white text-[#0076C0] hover:bg-gray-100 border-none">
                                시작하기
                            </Button>
                        </div>

                        <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-3 text-sm">진행 중인 대회</h3>
                            <div className="space-y-3">
                                <div className="text-sm">
                                    <div className="font-medium text-gray-700">제 1회 알고리즘 챔피언십</div>
                                    <div className="text-xs text-gray-400 mt-1">14:00 ~ 18:00 (진행중)</div>
                                </div>
                                <div className="text-sm">
                                    <div className="font-medium text-gray-700">주간 코딩 챌린지</div>
                                    <div className="text-xs text-gray-400 mt-1">D-2</div>
                                </div>
                            </div>
                        </div>

                        {/* Simple Footer for Sidebar */}
                        <div className="text-xs text-gray-400 px-2">
                            <p>&copy; 2025 Code Manager</p>
                            <div className="mt-2 space-x-2">
                                <a href="#" className="hover:underline">이용약관</a>
                                <a href="#" className="hover:underline">개인정보처리방침</a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
