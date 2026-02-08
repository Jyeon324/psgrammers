import { Link } from "wouter";
import { Search, BookOpen, Users, MessageSquare, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomeInflearn() {
    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans">
            {/* Header - Modern & Clean */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-[#1dc078] tracking-tight">Code Manager</span>
                        </Link>
                        <nav className="hidden md:flex space-x-6 text-[15px] font-medium text-gray-600">
                            <a href="#" className="hover:text-[#1dc078] transition-colors">강의</a>
                            <a href="#" className="hover:text-[#1dc078] transition-colors">로드맵</a>
                            <a href="#" className="hover:text-[#1dc078] transition-colors">멘토링</a>
                            <a href="#" className="hover:text-[#1dc078] transition-colors">커뮤니티</a>
                            <a href="#" className="hover:text-[#1dc078] transition-colors">채용</a>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative hidden lg:block w-80">
                            <Input
                                type="text"
                                placeholder="배우고 싶은 지식을 입력해보세요."
                                className="h-10 pl-4 pr-10 bg-gray-50 border-gray-200 rounded-full text-sm focus:ring-[#1dc078] focus:border-[#1dc078]"
                            />
                            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex items-center space-x-3 text-sm font-medium">
                            <Button variant="ghost" className="hover:bg-gray-50">로그인</Button>
                            <Button className="bg-[#1dc078] hover:bg-[#15a867] text-white rounded-md">회원가입</Button>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="bg-[#1e1e1e] text-white py-16">
                    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-block px-3 py-1 bg-[#1dc078]/20 text-[#1dc078] rounded-full text-sm font-bold">
                                NEW v2.0
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                성장하는 개발자를 위한<br />
                                <span className="text-[#1dc078]">최적의 코딩 학습 플랫폼</span>
                            </h1>
                            <p className="text-gray-400 text-lg">
                                기초부터 실전까지, 당신의 커리어를 위한 모든 것이 준비되어 있습니다.
                                지금 바로 시작해보세요.
                            </p>
                            <div className="flex space-x-4 pt-4">
                                <Button className="bg-[#1dc078] hover:bg-[#15a867] h-12 px-8 text-lg font-bold">
                                    강의 보러가기
                                </Button>
                                <Button variant="outline" className="h-12 px-8 text-lg font-bold border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                                    지식 공유하기
                                </Button>
                            </div>
                        </div>
                        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                            {/* Abstract Visual Placeholder */}
                            <div className="relative w-80 h-80 bg-gradient-to-br from-[#1dc078] to-[#0f603c] rounded-2xl opacity-20 blur-3xl absolute"></div>
                            <div className="relative z-10 w-96 h-64 bg-gray-800 rounded-lg border border-gray-700 shadow-2xl p-4 flex items-center justify-center">
                                <div className="text-center space-y-2">
                                    <div className="text-6xl">code</div>
                                    <div className="text-gray-500 font-mono text-sm">console.log("Hello World");</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Curation / Recommendation Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">왕초보를 위한 추천 로드맵</h2>
                                <p className="text-gray-500 mt-2">코딩이 처음이신가요? 이 순서대로 따라오세요.</p>
                            </div>
                            <a href="#" className="text-sm font-medium text-gray-500 hover:text-[#1dc078] flex items-center">
                                전체보기 <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i} className="group cursor-pointer border-none shadow-sm hover:shadow-lg transition-shadow duration-300">
                                    <div className="h-40 bg-gray-200 rounded-t-lg relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gray-800/10 group-hover:bg-gray-800/0 transition-colors"></div>
                                        {/* Placeholder for cover image */}
                                        <div className="absolute flex items-center justify-center inset-0 text-gray-400 font-bold text-xl">
                                            COURSE {i}
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <Badge variant="secondary" className="mb-2 text-[#1dc078] bg-[#1dc078]/10 hover:bg-[#1dc078]/20 border-none">
                                            입문자
                                        </Badge>
                                        <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#1dc078] transition-colors">
                                            [최신] 파이썬 무료 기초 강의 (2025년 버전)
                                        </h3>
                                        <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                                            <span className="font-medium text-gray-800">김코딩</span>
                                            <span>·</span>
                                            <div className="flex items-center text-yellow-500">
                                                <Star className="h-3 w-3 fill-current" />
                                                <Star className="h-3 w-3 fill-current" />
                                                <Star className="h-3 w-3 fill-current" />
                                                <Star className="h-3 w-3 fill-current" />
                                                <Star className="h-3 w-3 fill-current" />
                                                <span className="text-gray-800 ml-1">(4.9)</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-4 pb-4 pt-0">
                                        <div className="text-lg font-bold text-gray-800">
                                            Free
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-100 py-12">
                    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-xl font-bold text-gray-800 mb-4">Code Manager</div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                우리는 성장 기회의 평등을 추구합니다.<br />
                                누구나 배울 수 있는 곳.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">Code Manager</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-gray-800">소개</a></li>
                                <li><a href="#" className="hover:text-gray-800">채용</a></li>
                                <li><a href="#" className="hover:text-gray-800">블로그</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">고객센터</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-gray-800">자주 묻는 질문</a></li>
                                <li><a href="#" className="hover:text-gray-800">수료증 확인</a></li>
                                <li><a href="#" className="hover:text-gray-800">저작권 신고</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 mb-4">문의하기</h4>
                            <Button variant="outline" className="w-full">문의하기</Button>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
