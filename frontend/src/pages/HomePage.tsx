import Sidebar from "../components/Sidebar";

const HomePage: React.FC = () => {
  return (
    <>
      <Sidebar variant="home" />
      <div className="grid grid-rows-[auto_auto_1fr] dark:bg-white/8 p-8 gap-2 text-lg">
        <h1 className="col-span-full text-2xl font-[500]">Mock project UI</h1>
        <div>
          This is a mockup of the productivity/git tracker. It is completely
          static, has few interactive elements or working links. It isn&apos;t
          responsive, and some of the light-mode stuff might be broken. Links are
          on the sidebar, and you can get back here by pressing the cone in the
          top left corner.
        </div>
        <div>
          The blindtext (descriptions, readmes, ticket names, etc.) was all
          generated using ChatGPT, and shouldn&apos;t be used elsewhere.
          It&apos;s all just filler.
        </div>
      </div>
    </>
  );
};

export default HomePage;
