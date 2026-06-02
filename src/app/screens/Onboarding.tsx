import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileUp, ScanSearch, FileBarChart2 } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const features = [
  {
    Icon: FileUp,
    title: '계약서 업로드',
    description: 'PDF, 이미지, 텍스트 형식으로\n간편하게 계약서를 업로드하세요.',
    color: 'from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-200/60',
    iconBg: 'bg-[#EEF2FF]',
    iconColor: 'text-[#667AF2]',
  },
  {
    Icon: ScanSearch,
    title: 'AI 자동 분석',
    description: '인공지능이 계약서를 꼼꼼히\n분석하고 위험 요소를 찾아냅니다.',
    color: 'from-violet-500/10 to-purple-500/10',
    border: 'border-violet-200/60',
    iconBg: 'bg-[#F0EEFF]',
    iconColor: 'text-[#7C6AF2]',
  },
  {
    Icon: FileBarChart2,
    title: '상세 리포트',
    description: '분석 결과와 AI 챗봇으로\n궁금한 점을 바로 해결하세요.',
    color: 'from-indigo-500/10 to-blue-500/10',
    border: 'border-indigo-200/60',
    iconBg: 'bg-[#EEF4FF]',
    iconColor: 'text-[#4C7AF2]',
  },
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-8deg', '8deg']);
  const glowX = useTransform(xSpring, [-0.5, 0.5], ['0%', '100%']);
  const glowY = useTransform(ySpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      className={`relative cursor-default ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(108,128,221,0.15) 0%, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

export function Onboarding() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.15) 0%, rgba(95,117,177,0.06) 22%, transparent 46%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 배경 플로팅 오브 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(102,122,242,0.12) 0%, transparent 70%)' }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[-8%] top-[20%] h-[400px] w-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(128,151,248,0.10) 0%, transparent 70%)' }}
          animate={{ x: [0, -25, 0], y: [0, 30, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.div
          className="absolute bottom-[10%] left-[30%] h-[300px] w-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(95,117,177,0.08) 0%, transparent 70%)' }}
          animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1480px] flex-col px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24">

        {/* Header */}
        <motion.header variants={fadeIn} className="flex h-18 items-center justify-between py-4 sm:h-20 sm:py-0">
          <button
            onClick={() => navigate('/')}
            className="text-[18px] font-medium tracking-[0.18em] text-slate-700 hover:opacity-80 sm:text-[22px] lg:text-[24px]"
          >
            CLAIR.
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="text-[14px] font-medium text-slate-500 hover:text-slate-800 sm:text-[15px]"
          >
            건너뛰기
          </button>
        </motion.header>

        {/* Main */}
        <main className="flex flex-1 items-center py-6 sm:py-8 lg:py-0">
          <section className="mx-auto flex w-full max-w-[1180px] flex-col items-center">

            {/* 타이틀 */}
            <div className="max-w-[980px] text-center">
              <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D7E1FB] bg-white/80 px-4 py-1.5 text-[12px] font-medium text-[#6C80DD] shadow-sm backdrop-blur sm:text-[13px]">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >✦</motion.span>
                AI 계약서 분석 서비스
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-4 text-[28px] font-semibold leading-[1.22] tracking-[-0.04em] text-slate-900 sm:text-[36px] md:text-[44px] lg:text-[60px]"
              >
                <span className="block sm:inline">CLAIR를 통해</span>{' '}
                <span className="block sm:inline">복잡한 계약서를</span>
                <br className="hidden sm:block" />
                <motion.span
                  className="block bg-gradient-to-r from-[#667AF2] to-[#8097F8] bg-clip-text text-transparent sm:inline"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                >
                  쉽고 빠르게 분석하세요
                </motion.span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-5 max-w-[900px] text-[15px] leading-7 text-slate-500 sm:text-[17px] sm:leading-8 lg:mt-7 lg:text-[18px] lg:leading-9"
              >
                PDF, 이미지, 텍스트 형식의 계약서를 간편하게 업로드하고,
                인공지능을 통해 위험 요소를 자동 분석하여 상세 리포트를 제공합니다.
              </motion.p>
            </div>

            {/* Desktop 카드 */}
            <motion.div variants={fadeUp} className="mt-12 hidden w-full lg:block">
              <div className="grid grid-cols-3 gap-4">
                {features.map((item, i) => (
                  <TiltCard key={item.title} className="group">
                    <motion.div
                      className={`relative overflow-hidden rounded-[24px] border bg-white/80 p-7 backdrop-blur ${item.border}`}
                      style={{ boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}
                      whileHover={{ y: -6, boxShadow: '0 32px 80px rgba(102,122,242,0.18)' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-60`} />
                      <div className="relative">
                        <motion.div
                          className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                        >
                          <item.Icon className={`h-6 w-6 ${item.iconColor}`} />
                        </motion.div>
                        <h2 className="text-[20px] font-semibold text-slate-900">{item.title}</h2>
                        <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  </TiltCard>
                ))}
              </div>
            </motion.div>

            {/* Mobile 카드 */}
            <motion.div variants={containerVariants} className="mt-8 grid w-full gap-3 lg:hidden sm:mt-10 sm:gap-4">
              {features.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className={`relative overflow-hidden rounded-[22px] border bg-white/82 p-5 backdrop-blur ${item.border}`}
                  style={{ boxShadow: '0 18px 40px rgba(15,23,42,0.08)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-60`} />
                  <div className="relative flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                      <item.Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-[17px] font-semibold text-slate-900">{item.title}</h2>
                      <p className="mt-1.5 whitespace-pre-line text-[13px] leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </section>
        </main>

        {/* Bottom */}
        <motion.div variants={fadeUp} className="pb-4 pt-2 sm:pb-6 lg:pb-8">
          <div className="mx-auto grid w-full max-w-[1080px] grid-cols-[52px_1fr_52px] items-center gap-3 sm:grid-cols-[56px_1fr_56px] sm:gap-4">
            <motion.button
              onClick={() => navigate('/')}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm sm:h-[56px] sm:w-[56px]"
              whileHover={{ scale: 1.08, backgroundColor: '#f8faff' }}
              whileTap={{ scale: 0.94 }}
              aria-label="이전"
            >
              <ChevronLeft size={22} />
            </motion.button>

            <motion.button
              onClick={() => navigate('/signup')}
              onHoverStart={() => setHovered(true)}
              onHoverEnd={() => setHovered(false)}
              className="relative h-[52px] w-full overflow-hidden rounded-[18px] font-semibold text-white sm:h-[56px] sm:rounded-[20px] lg:h-[64px] lg:rounded-[24px]"
              style={{
                background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                boxShadow: '0 18px 38px rgba(102,122,242,0.28)',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 24px 50px rgba(102,122,242,0.40)' }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={hovered ? { x: ['−100%', '200%'] } : { x: '-100%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              <span className="relative text-[15px] sm:text-[16px] lg:text-[17px]">시작하기</span>
            </motion.button>

            <div aria-hidden="true" />
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
