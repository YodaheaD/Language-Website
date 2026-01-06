"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Globe, Layers, Plus, Zap } from "lucide-react";
import { ES, JP } from 'country-flag-icons/react/3x2';
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function Dashboard() {
  const { spanishWords, japaneseWords, totalSets, loading: isLoading, error } = useDashboardStats();

  return (
    <div className="w-full min-h-[90vh] bg-background p-6 sm:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your language learning progress.
            </p>
            {error && (
              <p className="text-sm text-red-500 mt-2">
                Failed to load some stats. Please try refreshing the page.
              </p>
            )}
          </div>
          <Link href="/study">
            <Button size="lg" className="gap-2">
              <Zap className="h-4 w-4" />
              Quick Study
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Words</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">
                  {spanishWords + japaneseWords}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Across all languages
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spanish</CardTitle>
              <ES title="Spain" className="h-6 w-6 rounded-sm shadow-sm" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{spanishWords}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Words learned
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Japanese</CardTitle>
              <JP title="Japan" className="h-6 w-6 rounded-sm shadow-sm" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{japaneseWords}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Words learned
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Sets</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{totalSets}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Created sets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-8 md:grid-cols-7">
          {/* Quick Actions */}
          <Card className="md:col-span-4 lg:col-span-5">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump right back into learning or manage your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Link href="/study/Quiz/spanish+1+10+definition+Numerical">
                <Card className="hover:bg-accent transition-colors cursor-pointer border-2 hover:border-primary/50 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ES title="Spain" className="h-5 w-5 rounded-sm" /> Practice Spanish
                    </CardTitle>
                    <CardDescription>
                      Start a quick quiz with 10 random words
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/study/Quiz/japanese+1+10+word+Numerical">
                <Card className="hover:bg-accent transition-colors cursor-pointer border-2 hover:border-primary/50 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <JP title="Japan" className="h-5 w-5 rounded-sm" /> Practice Japanese
                    </CardTitle>
                    <CardDescription>
                      Start a quick quiz with 10 random words
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/sets">
                <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed h-full flex flex-col justify-center items-center p-6 text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="font-medium">Create New Set</div>
                  <div className="text-sm text-muted-foreground">
                    Organize words into custom collections
                  </div>
                </Card>
              </Link>
              <Link href="/view">
                <Card className="hover:bg-accent transition-colors cursor-pointer border-dashed h-full flex flex-col justify-center items-center p-6 text-center space-y-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="font-medium">View All Words</div>
                  <div className="text-sm text-muted-foreground">
                    Browse and manage your vocabulary
                  </div>
                </Card>
              </Link>
            </CardContent>
          </Card>

          {/* Decorative / Motivation */}
          <Card className="md:col-span-3 lg:col-span-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-none shadow-inner">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Global Progress
              </CardTitle>
              <CardDescription>
                Keep expanding your horizons!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <div className="relative w-full max-w-[200px] aspect-square">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <img 
                  src="./world.svg" 
                  alt="World Map" 
                  className="relative w-full h-full object-contain drop-shadow-xl opacity-90"
                />
              </div>
              <div className="mt-8 w-full">
                <Link href="/study">
                  <Button className="w-full" variant="default">
                    Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
