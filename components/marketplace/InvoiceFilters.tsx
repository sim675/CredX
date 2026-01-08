"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Filter as FilterIcon } from "lucide-react"
import type { YieldRange, DurationRange } from "@/lib/invoice"

type SortOption = "yield" | "dueDate" | "risk"

interface InvoiceFiltersProps {
  onFilterChange: (filters: {
    yieldRanges: YieldRange[]
    durationRanges: DurationRange[]
    verifiedBuyer: boolean
    sortBy: SortOption
  }) => void
}

export function InvoiceFilters({ onFilterChange }: InvoiceFiltersProps) {
  const [yieldRanges, setYieldRanges] = useState<YieldRange[]>([])
  const [durationRanges, setDurationRanges] = useState<DurationRange[]>([])
  const [verifiedBuyer, setVerifiedBuyer] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("yield")
  const [isOpen, setIsOpen] = useState(false)

  const handleYieldChange = (yieldRange: YieldRange, checked: boolean) => {
    const newRanges = checked
      ? [...yieldRanges, yieldRange]
      : yieldRanges.filter((r) => r !== yieldRange)
    setYieldRanges(newRanges)
    applyFilters({ yieldRanges: newRanges })
  }

  const handleDurationChange = (duration: DurationRange, checked: boolean) => {
    const newRanges = checked
      ? [...durationRanges, duration]
      : durationRanges.filter((d) => d !== duration)
    setDurationRanges(newRanges)
    applyFilters({ durationRanges: newRanges })
  }

  const handleVerifiedBuyerChange = (checked: boolean) => {
    setVerifiedBuyer(checked)
    applyFilters({ verifiedBuyer: checked })
  }

  const handleSortChange = (value: string) => {
    const sortValue = value as SortOption
    setSortBy(sortValue)
    applyFilters({ sortBy: sortValue })
  }

  const clearFilters = () => {
    setYieldRanges([])
    setDurationRanges([])
    setVerifiedBuyer(false)
    setSortBy("yield")
    applyFilters({
      yieldRanges: [],
      durationRanges: [],
      verifiedBuyer: false,
      sortBy: "yield"
    })
  }

  const applyFilters = (updates: Partial<{
    yieldRanges: YieldRange[]
    durationRanges: DurationRange[]
    verifiedBuyer: boolean
    sortBy: SortOption
  }>) => {
    onFilterChange({
      yieldRanges: updates.yieldRanges ?? yieldRanges,
      durationRanges: updates.durationRanges ?? durationRanges,
      verifiedBuyer: updates.verifiedBuyer ?? verifiedBuyer,
      sortBy: updates.sortBy ?? sortBy
    })
  }

  const activeFilterCount = [
    ...yieldRanges,
    ...durationRanges,
    ...(verifiedBuyer ? ['verified'] : [])
  ].length

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-medium">Filter & Sort</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <span className="text-muted-foreground text-sm">Sort by: </span>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yield">Highest Yield</SelectItem>
              <SelectItem value="dueDate">Earliest Due Date</SelectItem>
              <SelectItem value="risk">Lowest Risk</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4" align="end">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-sm text-primary"
                      onClick={clearFilters}
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Yield</h5>
                    <div className="space-y-2">
                      {[
                        { value: 'high' as const, label: 'High Yield' },
                        { value: 'medium' as const, label: 'Medium Yield' },
                        { value: 'low' as const, label: 'Low Yield' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`yield-${option.value}`}
                            checked={yieldRanges.includes(option.value)}
                            onCheckedChange={(checked) =>
                              handleYieldChange(option.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={`yield-${option.value}`} className="text-sm font-normal">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h5 className="text-sm font-medium mb-2">Duration</h5>
                    <div className="space-y-2">
                      {[
                        { value: 'short' as const, label: 'Short (<30 days)' },
                        { value: 'medium' as const, label: 'Medium (30-60 days)' },
                        { value: 'long' as const, label: 'Long (>60 days)' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`duration-${option.value}`}
                            checked={durationRanges.includes(option.value)}
                            onCheckedChange={(checked) =>
                              handleDurationChange(option.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={`duration-${option.value}`} className="text-sm font-normal">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified-buyer"
                        checked={verifiedBuyer}
                        onCheckedChange={(checked) => handleVerifiedBuyerChange(checked as boolean)}
                      />
                      <Label htmlFor="verified-buyer" className="text-sm font-normal">
                        Verified Buyers Only
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {yieldRanges.map((range) => (
            <Badge key={range} variant="secondary" className="gap-1">
              {{
                high: 'High Yield',
                medium: 'Medium Yield',
                low: 'Low Yield',
              }[range]}
              <button
                type="button"
                onClick={() => handleYieldChange(range, false)}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {durationRanges.map((duration) => (
            <Badge key={duration} variant="secondary" className="gap-1">
              {{
                short: 'Short Term',
                medium: 'Medium Term',
                long: 'Long Term',
              }[duration]}
              <button
                type="button"
                onClick={() => handleDurationChange(duration, false)}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {verifiedBuyer && (
            <Badge variant="secondary" className="gap-1">
              Verified Buyers
              <button
                type="button"
                onClick={() => handleVerifiedBuyerChange(false)}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
