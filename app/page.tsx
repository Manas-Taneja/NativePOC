"use client"

import * as React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { MetricTile } from "@/components/ui/metric-tile"
import { InsightCard } from "@/components/ui/insight-card"
import { Button } from "@/components/ui/button"
import { ChatStream } from "@/components/chat-stream"
import { motion, AnimatePresence } from "framer-motion"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { mockMessages, mockMetrics, mockInsights } from "@/lib/mock-data"

export default function Home() {
  const [isRightColumnVisible, setIsRightColumnVisible] = React.useState(true)
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      <DashboardHeader />
      
      <main className="max-w-[1800px] mx-auto px-5 md:px-8 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-8"
        >
          {/* Two Column Layout: Chat + Overview */}
          <motion.div
            variants={staggerItem}
            className={`grid grid-cols-1 gap-6 transition-all duration-300 ${
              isRightColumnVisible ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
            }`}
          >
            {/* Left Column: Native Chat Stream */}
            <Card className="h-[calc(100vh-6.3rem)] flex flex-col overflow-hidden">
              <div className="border-b border-[var(--color-border-subtle)] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white"
                      >
                        <path
                          d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle cx="7" cy="9" r="1" fill="currentColor" />
                        <circle cx="13" cy="9" r="1" fill="currentColor" />
                        <path
                          d="M7 12C7.5 13 8.5 14 10 14C11.5 14 12.5 13 13 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
                        Team Chat
                      </h2>
                      <p className="text-sm text-[var(--color-fg-tertiary)]">
                        4 members · @Native for AI updates
                      </p>
                    </div>
                  </div>
                  
                  {/* Toggle Button */}
                  <motion.button
                    onClick={() => setIsRightColumnVisible(!isRightColumnVisible)}
                    className="h-10 w-10 rounded-full bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Toggle sidebar"
                  >
                    <motion.svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[var(--color-fg-primary)]"
                      animate={{ rotate: isRightColumnVisible ? 0 : 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        d="M8 4L12 10L8 16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </motion.button>
                </div>
              </div>
              <ChatStream messages={mockMessages} />
            </Card>

            {/* Right Column: Overview */}
            <AnimatePresence mode="wait">
              {isRightColumnVisible && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mockMetrics.map((metric, i) => (
                  <MetricTile
                    key={i}
                    label={metric.label}
                    value={metric.value}
                    trend={metric.trend}
                  />
                ))}
              </div>

              {/* Insights */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-fg-primary)] mb-4">
                  Key Insights
                </h3>
                <div className="space-y-4">
                  {mockInsights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" size="small" className="justify-start">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                      >
                        <path
                          d="M2 8H14M8 2V14"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      New Report
                    </Button>
                    <Button variant="secondary" size="small" className="justify-start">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                      >
                        <path
                          d="M3 5H13M3 8H13M3 11H9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      View Analytics
                    </Button>
                    <Button variant="secondary" size="small" className="justify-start">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                      >
                        <path
                          d="M14 9V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8 10V2M8 2L5 5M8 2L11 5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Export Data
                    </Button>
                    <Button variant="secondary" size="small" className="justify-start">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                      >
                        <path
                          d="M13.5 8C13.5 10.7614 11.2614 13 8.5 13C5.73858 13 3.5 10.7614 3.5 8C3.5 5.23858 5.73858 3 8.5 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M13.5 3V8H8.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Refresh Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Component Showcase at Bottom */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Component Showcase</CardTitle>
                <CardDescription>
                  Design system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-fg-primary)] mb-3">
                      Button Variants
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary" size="small">Primary</Button>
                      <Button variant="secondary" size="small">Secondary</Button>
                      <Button variant="outline" size="small">Outline</Button>
                      <Button variant="ghost" size="small">Ghost</Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-[var(--color-fg-primary)] mb-3">
                      Button Sizes
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="primary" size="small">Small</Button>
                      <Button variant="primary" size="medium">Medium</Button>
                      <Button variant="primary" size="large">Large</Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[var(--color-fg-primary)] mb-3">
                      Card Variants
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card variant="default">
                        <div className="p-4">
                          <p className="text-sm font-medium text-[var(--color-fg-primary)]">Default Card</p>
                          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">Standard elevation</p>
                        </div>
                      </Card>
                      <Card variant="interactive">
                        <div className="p-4">
                          <p className="text-sm font-medium text-[var(--color-fg-primary)]">Interactive Card</p>
                          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">Hover to see effect</p>
                        </div>
                      </Card>
                      <Card variant="accent">
                        <div className="p-4">
                          <p className="text-sm font-medium text-[var(--color-fg-primary)]">Accent Card</p>
                          <p className="text-xs text-[var(--color-fg-tertiary)] mt-1">Left accent border</p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
