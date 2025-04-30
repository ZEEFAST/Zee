import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeftRight, PiggyBank, Landmark, Receipt } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function QuickActions() {
  const { t } = useLanguage();

  const actions = [
    {
      icon: <ArrowLeftRight className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      bgClass: "bg-primary-100 dark:bg-primary-900",
      label: t('transfer'),
      link: "/transfers"
    },
    {
      icon: <PiggyBank className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />,
      bgClass: "bg-secondary-100 dark:bg-secondary-900",
      label: t('deposit'),
      link: "/accounts"
    },
    {
      icon: <Landmark className="h-6 w-6 text-green-600 dark:text-green-400" />,
      bgClass: "bg-green-100 dark:bg-green-900",
      label: t('loans'),
      link: "/loans"
    },
    {
      icon: <Receipt className="h-6 w-6 text-red-600 dark:text-red-400" />,
      bgClass: "bg-red-100 dark:bg-red-900",
      label: t('payBills'),
      link: "/bill-pay"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('quickActions')}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto"
              asChild
            >
              <Link href={action.link}>
                <div className={`rounded-full ${action.bgClass} p-2 mb-2`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
        
        <div className="mt-4">
          <Button className="w-full">
            {t('moreServices')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
